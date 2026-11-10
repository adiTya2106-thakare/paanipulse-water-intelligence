"""
PAANIPULSE - Automated Test Suite
Covers Backend Unit, Algorithm, API Endpoints, Anti-Manipulation, and Integration Tests.
"""
import sys
import os
import unittest
import json
from datetime import datetime, timezone, timedelta

# Set path to backend
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from models import WaterReport, VALID_OBSERVATION_TYPES
from algorithms import calculate_confidence, calculate_fingerprint, detect_disruptions
from lambda_function import lambda_handler, check_rate_limit, _RATE_LIMITS
from database import db

class TestPaanipulse(unittest.TestCase):

    def setUp(self):
        # Clear rate limits before each test
        _RATE_LIMITS.clear()

    # --- 1. Models and Input Validation ---
    def test_model_valid_submission(self):
        payload = {
            "localityId": "mumbai-bandra-west",
            "observationType": "WATER_AVAILABLE",
            "pressureLevel": "NORMAL",
            "notes": "Good pressure in building tank."
        }
        valid, msg = WaterReport.validate_submission(payload)
        self.assertTrue(valid)
        self.assertEqual(msg, "")

    def test_model_invalid_observation_type(self):
        payload = {
            "localityId": "mumbai-bandra-west",
            "observationType": "INVALID_STATUS"
        }
        valid, msg = WaterReport.validate_submission(payload)
        self.assertFalse(valid)
        self.assertIn("Invalid observationType", msg)

    def test_model_xss_sanitization(self):
        payload = {
            "localityId": "mumbai-powai",
            "observationType": "WATER_AVAILABLE",
            "notes": "Safe text <script>alert('hack')</script> end."
        }
        valid, _ = WaterReport.validate_submission(payload)
        self.assertTrue(valid)
        self.assertEqual(payload["notes"], "Safe text alert('hack') end.")

    def test_model_excessive_notes_length(self):
        payload = {
            "localityId": "mumbai-powai",
            "observationType": "WATER_AVAILABLE",
            "notes": "A" * 350
        }
        valid, msg = WaterReport.validate_submission(payload)
        self.assertFalse(valid)
        self.assertIn("280 characters", msg)

    # --- 2. Community Signal Confidence Algorithm ---
    def test_confidence_zero_reports(self):
        res = calculate_confidence([])
        self.assertEqual(res["level"], "LOW")
        self.assertEqual(res["score"], 0.0)
        self.assertEqual(res["distinct_reporters"], 0)

    def test_confidence_stronger_signal(self):
        now = datetime.now(timezone.utc)
        reports = [
            {"timestamp": (now - timedelta(minutes=15)).isoformat(), "observation_type": "WATER_AVAILABLE", "reporter_token": "usr-1"},
            {"timestamp": (now - timedelta(minutes=30)).isoformat(), "observation_type": "WATER_AVAILABLE", "reporter_token": "usr-2"},
            {"timestamp": (now - timedelta(hours=1)).isoformat(), "observation_type": "WATER_AVAILABLE", "reporter_token": "usr-3"},
            {"timestamp": (now - timedelta(hours=1.5)).isoformat(), "observation_type": "WATER_AVAILABLE", "reporter_token": "usr-4"},
            {"timestamp": (now - timedelta(hours=3)).isoformat(), "observation_type": "WATER_AVAILABLE", "reporter_token": "usr-5"}
        ]
        res = calculate_confidence(reports, now=now)
        self.assertEqual(res["level"], "STRONGER")
        self.assertGreaterEqual(res["score"], 65.0)
        self.assertEqual(res["distinct_reporters"], 5)

    # --- 3. Water Fingerprint Engine ---
    def test_fingerprint_developing_threshold(self):
        # 3 reports is less than MIN_THRESHOLD (12)
        sparse_reports = [
            {"timestamp": datetime.now(timezone.utc).isoformat(), "observation_type": "WATER_AVAILABLE"}
        ]
        fp = calculate_fingerprint("sparse-loc", sparse_reports, baseline_config=None)
        self.assertEqual(fp["status"], "DEVELOPING")
        self.assertIn("Water Fingerprint is developing", fp["message"])

    def test_fingerprint_established_baseline(self):
        now = datetime.now(timezone.utc)
        established_reports = [
            {"timestamp": (now - timedelta(hours=i*2)).isoformat(), "observation_type": "WATER_AVAILABLE"}
            for i in range(15)
        ]
        fp = calculate_fingerprint("mumbai-powai", established_reports)
        self.assertEqual(fp["status"], "ESTABLISHED_BASELINE")
        self.assertIn("MORNING", fp["window_profiles"])

    # --- 4. Explainable Disruption Anomaly Detection ---
    def test_disruption_detection_triggered(self):
        now = datetime.now(timezone.utc)
        # Fingerprint showing 85% normal availability
        fp = {
            "status": "ESTABLISHED_BASELINE",
            "window_profiles": {
                "MORNING": {"availability_share": 85.0},
                "MIDDAY": {"availability_share": 75.0},
                "EVENING": {"availability_share": 80.0},
                "NIGHT": {"availability_share": 60.0}
            }
        }
        # Recent reports (last 1 hour) showing complete outage
        recent = [
            {"timestamp": (now - timedelta(minutes=20)).isoformat(), "observation_type": "NO_WATER", "reporter_token": "usr-A"},
            {"timestamp": (now - timedelta(minutes=40)).isoformat(), "observation_type": "NO_WATER", "reporter_token": "usr-B"},
            {"timestamp": (now - timedelta(minutes=50)).isoformat(), "observation_type": "DELAYED_SUPPLY", "reporter_token": "usr-C"},
        ]
        alert = detect_disruptions("bandra", "Bandra West", recent, fp, now=now)
        self.assertIsNotNone(alert)
        self.assertEqual(alert["severity"], "WARNING")
        self.assertIn("possible supply disruption", alert["title"].lower())
        self.assertNotIn("official water outage confirmed", alert["title"].lower())
        self.assertEqual(alert["disruption_report_count"], 3)

    # --- 5. Rate Limiting and Anti-Tamper ---
    def test_rate_limiting_enforced(self):
        token = "test-spammer-device"
        # First 3 submissions should succeed
        self.assertTrue(check_rate_limit(token, max_submissions=3, window_minutes=15))
        self.assertTrue(check_rate_limit(token, max_submissions=3, window_minutes=15))
        self.assertTrue(check_rate_limit(token, max_submissions=3, window_minutes=15))
        # 4th submission in same 15 mins must be rejected
        self.assertFalse(check_rate_limit(token, max_submissions=3, window_minutes=15))

    # --- 6. API Endpoints (AWS Lambda Handler) ---
    def test_api_health_endpoint(self):
        event = {"httpMethod": "GET", "rawPath": "/health"}
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        self.assertEqual(body["status"], "healthy")

    def test_api_localities_catalog(self):
        event = {"httpMethod": "GET", "rawPath": "/localities"}
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        self.assertGreaterEqual(len(body["localities"]), 4)

    def test_api_summary_endpoint(self):
        event = {
            "httpMethod": "GET",
            "rawPath": "/summary",
            "queryStringParameters": {"localityId": "mumbai-bandra-west"}
        }
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        self.assertIn("reported_availability_share", body)
        self.assertIn("confidence", body)

    def test_api_empty_locality_pristine_state(self):
        event = {
            "httpMethod": "GET",
            "rawPath": "/summary",
            "queryStringParameters": {"localityId": "delhi-dwarka"}
        }
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        self.assertEqual(body["total_reports"], 0)
        self.assertEqual(body["current_status"], "INSUFFICIENT_DATA")

    def test_api_post_report_and_persistence(self):
        payload = {
            "localityId": "pune-kothrud",
            "observationType": "WATER_AVAILABLE",
            "pressureLevel": "NORMAL",
            "notes": "Verified integration test submission.",
            "reporterToken": "integration-test-device-1"
        }
        event = {
            "httpMethod": "POST",
            "rawPath": "/reports",
            "body": json.dumps(payload)
        }
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 201)
        body = json.loads(res["body"])
        self.assertIn("report", body)
        self.assertEqual(body["report"]["locality_id"], "pune-kothrud")

        # Verify persistence via GET /reports
        query_event = {
            "httpMethod": "GET",
            "rawPath": "/reports",
            "queryStringParameters": {"localityId": "pune-kothrud"}
        }
        query_res = lambda_handler(query_event, None)
        query_body = json.loads(query_res["body"])
        stored_notes = [r.get("notes") for r in query_body["reports"]]
        self.assertIn("Verified integration test submission.", stored_notes)

    def test_api_admin_moderation_security(self):
        # 1. Invalid passcode rejected
        bad_event = {
            "httpMethod": "POST",
            "rawPath": "/admin/moderate",
            "body": json.dumps({"adminPasscode": "wrong-key", "reportId": "any", "flag": True})
        }
        res = lambda_handler(bad_event, None)
        self.assertEqual(res["statusCode"], 401)

        # 2. Valid passcode accepted
        good_event = {
            "httpMethod": "POST",
            "rawPath": "/admin/moderate",
            "body": json.dumps({"adminPasscode": "paanipulse-admin-2026", "reportId": "demo-rep-bandra-1", "flag": True})
        }
        res2 = lambda_handler(good_event, None)
        self.assertEqual(res2["statusCode"], 200)

if __name__ == "__main__":
    unittest.main()

