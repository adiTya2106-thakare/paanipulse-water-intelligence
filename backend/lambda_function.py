"""
PAANIPULSE - AWS Lambda Serverless Entry Point
Handles Amazon API Gateway (REST & HTTP API v2 payload formats) requests.
Provides fully documented endpoints for the civic water intelligence network.
"""
import json
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional

from models import WaterReport, VALID_OBSERVATION_TYPES
from database import db
from algorithms import calculate_confidence, calculate_fingerprint, detect_disruptions

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# In-memory token rate-limiter: records timestamps per reporter token
_RATE_LIMITS: Dict[str, list] = {}

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Reporter-Token",
    "Content-Type": "application/json"
}

def build_response(status_code: int, body: Any) -> Dict[str, Any]:
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, default=str)
    }

def check_rate_limit(reporter_token: str, max_submissions: int = 3, window_minutes: int = 15) -> bool:
    """
    Prevents single user/bot from spamming reports.
    Allows max 3 submissions per 15 minutes per token.
    """
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(minutes=window_minutes)
    
    if reporter_token not in _RATE_LIMITS:
        _RATE_LIMITS[reporter_token] = [now]
        return True

    # Filter out timestamps older than window
    recent = [t for t in _RATE_LIMITS[reporter_token] if t > cutoff]
    if len(recent) >= max_submissions:
        return False

    recent.append(now)
    _RATE_LIMITS[reporter_token] = recent
    return True

def lambda_handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:
    """
    AWS Lambda main handler compatible with both API Gateway v1 (REST) and v2 (HTTP API).
    """
    try:
        # Handle HTTP method & path detection
        http_method = event.get("httpMethod") or event.get("requestContext", {}).get("http", {}).get("method", "GET")
        http_method = http_method.upper()

        raw_path = event.get("rawPath") or event.get("path") or "/"
        # Normalize path
        if raw_path.startswith("/prod") or raw_path.startswith("/dev") or raw_path.startswith("/staging"):
            raw_path = "/" + "/".join(raw_path.split("/")[2:])
        if not raw_path:
            raw_path = "/"

        # Handle OPTIONS preflight
        if http_method == "OPTIONS":
            return build_response(200, {"message": "CORS preflight OK"})

        query_params = event.get("queryStringParameters") or {}
        if query_params is None:
            query_params = {}

        # 1. Health check: GET /health
        if raw_path == "/health" and http_method == "GET":
            return build_response(200, {
                "status": "healthy",
                "service": "PAANIPULSE Cloud API",
                "version": "1.0.0",
                "runtime": "AWS Lambda (Python 3.12+)",
                "database_mode": "DynamoDB (active)" if db.use_dynamodb else "In-Memory Engine (local/test mode)",
                "timestamp": datetime.now(timezone.utc).isoformat()
            })

        # 2. Localities Catalog: GET /localities
        if raw_path == "/localities" and http_method == "GET":
            localities = db.get_localities()
            # Attach live stats to each locality
            results = []
            for loc in localities:
                reports = db.get_all_reports_for_locality(loc["id"])
                conf = calculate_confidence(reports)
                fp = calculate_fingerprint(loc["id"], reports, loc)
                alert = detect_disruptions(loc["id"], loc["name"], reports, fp)
                
                # Availability share calculation: (valid avail reports / valid status reports) * 100
                total_reports = len(reports)
                avail_count = sum(1 for r in reports if r.get("observation_type") == "WATER_AVAILABLE")
                avail_share = round((avail_count / total_reports * 100.0), 1) if total_reports > 0 else 0.0

                current_status = "INSUFFICIENT_DATA"
                if total_reports == 0:
                    current_status = "INSUFFICIENT_DATA"
                elif alert:
                    current_status = "POSSIBLE_DISRUPTION"
                elif avail_share >= 65.0:
                    current_status = "REPORTED_AVAILABLE"
                else:
                    current_status = "IMPROVING_OR_INTERMITTENT"

                results.append({
                    **loc,
                    "total_reports": total_reports,
                    "reported_availability_share": avail_share,
                    "community_confidence": conf["level"],
                    "community_confidence_label": conf["label"],
                    "current_status": current_status,
                    "has_active_alert": alert is not None
                })

            return build_response(200, {"localities": results})

        # 3. Locality Summary: GET /summary?localityId=...
        if raw_path == "/summary" and http_method == "GET":
            locality_id = query_params.get("localityId") or query_params.get("locality_id")
            if not locality_id:
                return build_response(400, {"error": "Missing localityId query parameter."})

            loc = db.get_locality_by_id(locality_id)
            if not loc:
                return build_response(404, {"error": f"Locality '{locality_id}' not found."})

            reports = db.get_all_reports_for_locality(locality_id)
            confidence = calculate_confidence(reports)
            fingerprint = calculate_fingerprint(locality_id, reports, loc)
            alert = detect_disruptions(locality_id, loc["name"], reports, fingerprint)

            total_reports = len(reports)
            avail_count = sum(1 for r in reports if r.get("observation_type") == "WATER_AVAILABLE")
            no_water_count = sum(1 for r in reports if r.get("observation_type") == "NO_WATER")
            low_pressure_count = sum(1 for r in reports if r.get("observation_type") == "LOW_PRESSURE")
            delayed_count = sum(1 for r in reports if r.get("observation_type") == "DELAYED_SUPPLY")

            avail_share = round((avail_count / total_reports * 100.0), 1) if total_reports > 0 else 0.0
            low_pressure_share = round((low_pressure_count / total_reports * 100.0), 1) if total_reports > 0 else 0.0
            delayed_share = round((delayed_count / total_reports * 100.0), 1) if total_reports > 0 else 0.0

            # Determine human-readable community status
            if total_reports == 0:
                current_status = "INSUFFICIENT_DATA"
                status_label = "Insufficient Community Data"
                status_description = "No recent community reports received yet for this locality."
            elif alert:
                current_status = "POSSIBLE_DISRUPTION"
                status_label = "Community reports indicate a possible supply disruption"
                status_description = alert["what_changed"]
            elif avail_share >= 65.0:
                current_status = "REPORTED_AVAILABLE"
                status_label = "Reported Water Available"
                status_description = f"Most recent community observations ({avail_share}%) report active water flow."
            elif low_pressure_share >= 40.0:
                current_status = "LOW_PRESSURE_REPORTED"
                status_label = "Low Pressure Reported"
                status_description = "Multiple neighbours observe lower than usual water pressure."
            else:
                current_status = "INTERMITTENT_SUPPLY"
                status_label = "Intermittent Supply Reported"
                status_description = "Mixed reports received; supply may be delayed or variable."

            return build_response(200, {
                "locality": loc,
                "total_reports": total_reports,
                "reported_availability_share": avail_share,
                "low_pressure_share": low_pressure_share,
                "delayed_share": delayed_share,
                "current_status": current_status,
                "status_label": status_label,
                "status_description": status_description,
                "confidence": confidence,
                "alert": alert,
                "has_demo_data": loc.get("has_demo_data", False),
                "disclaimer": "PAANIPULSE displays community-reported observations, not official municipal telemetry."
            })

        # 4. Filtered Reports Timeline: GET /reports?localityId=...&limit=...
        if raw_path == "/reports" and http_method == "GET":
            locality_id = query_params.get("localityId") or query_params.get("locality_id")
            if not locality_id:
                return build_response(400, {"error": "Missing localityId query parameter."})

            limit = int(query_params.get("limit", 50))
            reports = db.query_reports(locality_id, limit=limit)
            return build_response(200, {
                "locality_id": locality_id,
                "count": len(reports),
                "reports": reports
            })

        # 5. Locality Water Fingerprint: GET /fingerprint?localityId=...
        if raw_path == "/fingerprint" and http_method == "GET":
            locality_id = query_params.get("localityId") or query_params.get("locality_id")
            if not locality_id:
                return build_response(400, {"error": "Missing localityId query parameter."})

            loc = db.get_locality_by_id(locality_id)
            if not loc:
                return build_response(404, {"error": f"Locality '{locality_id}' not found."})

            reports = db.get_all_reports_for_locality(locality_id)
            fp = calculate_fingerprint(locality_id, reports, loc)
            return build_response(200, fp)

        # 6. Active Early-Warning Alerts: GET /alerts?localityId=...
        if raw_path == "/alerts" and http_method == "GET":
            locality_id = query_params.get("localityId") or query_params.get("locality_id")
            alerts = []
            
            if locality_id:
                loc = db.get_locality_by_id(locality_id)
                if loc:
                    reports = db.get_all_reports_for_locality(locality_id)
                    fp = calculate_fingerprint(locality_id, reports, loc)
                    alert = detect_disruptions(locality_id, loc["name"], reports, fp)
                    if alert:
                        alerts.append(alert)
            else:
                # Check all localities
                for loc in db.get_localities():
                    reports = db.get_all_reports_for_locality(loc["id"])
                    fp = calculate_fingerprint(loc["id"], reports, loc)
                    alert = detect_disruptions(loc["id"], loc["name"], reports, fp)
                    if alert:
                        alerts.append(alert)

            return build_response(200, {"alerts": alerts})

        # 7. Submit Community Report: POST /reports
        if raw_path == "/reports" and http_method == "POST":
            raw_body = event.get("body", "{}")
            if isinstance(raw_body, str):
                try:
                    payload = json.loads(raw_body)
                except Exception:
                    return build_response(400, {"error": "Invalid JSON body."})
            else:
                payload = raw_body

            is_valid, err_msg = WaterReport.validate_submission(payload)
            if not is_valid:
                return build_response(400, {"error": err_msg})

            locality_id = payload.get("localityId") or payload.get("locality_id")
            loc = db.get_locality_by_id(locality_id)
            if not loc:
                return build_response(404, {"error": f"Locality '{locality_id}' is not in the recognized registry."})

            # Rate limiting check
            reporter_token = payload.get("reporterToken", "anon-device").strip()
            if not reporter_token:
                reporter_token = "anon-device"

            if not check_rate_limit(reporter_token):
                return build_response(429, {
                    "error": "Rate limit exceeded. To protect community data integrity, maximum 3 reports are permitted every 15 minutes per device."
                })

            report_id = f"rep-{uuid.uuid4().hex[:10]}"
            server_now = datetime.now(timezone.utc).isoformat()

            new_report = WaterReport(
                report_id=report_id,
                locality_id=locality_id,
                locality_name=loc["name"],
                observation_type=payload.get("observationType") or payload.get("observation_type"),
                pressure_level=payload.get("pressureLevel") or payload.get("pressure_level", "NORMAL"),
                notes=payload.get("notes", ""),
                timestamp=server_now,
                reporter_token=reporter_token,
                client_ip_hash=event.get("requestContext", {}).get("identity", {}).get("sourceIp", "0.0.0.0"),
                is_demo_data=False,
                flagged=False
            )

            saved = db.insert_report(new_report.to_dict())

            # Return success with updated summary
            reports = db.get_all_reports_for_locality(locality_id)
            conf = calculate_confidence(reports)
            fp = calculate_fingerprint(locality_id, reports, loc)
            alert = detect_disruptions(locality_id, loc["name"], reports, fp)

            return build_response(201, {
                "message": "Report submitted successfully. Thank you for strengthening your neighbourhood's water intelligence.",
                "report": saved,
                "locality_confidence": conf["level"],
                "has_disruption_warning": alert is not None
            })

        # 8. Downloadable Evidence-Based Locality Report: GET /report-card?localityId=...
        if raw_path == "/report-card" and http_method == "GET":
            locality_id = query_params.get("localityId") or query_params.get("locality_id")
            if not locality_id:
                return build_response(400, {"error": "Missing localityId parameter."})

            loc = db.get_locality_by_id(locality_id)
            if not loc:
                return build_response(404, {"error": "Locality not found."})

            reports = db.get_all_reports_for_locality(locality_id)
            conf = calculate_confidence(reports)
            fp = calculate_fingerprint(locality_id, reports, loc)
            alert = detect_disruptions(locality_id, loc["name"], reports, fp)

            total_reports = len(reports)
            avail_count = sum(1 for r in reports if r.get("observation_type") == "WATER_AVAILABLE")
            low_pressure_count = sum(1 for r in reports if r.get("observation_type") == "LOW_PRESSURE")
            delayed_count = sum(1 for r in reports if r.get("observation_type") == "DELAYED_SUPPLY")
            no_water_count = sum(1 for r in reports if r.get("observation_type") == "NO_WATER")

            report_card = {
                "report_title": f"PAANIPULSE Neighbourhood Water Intelligence Audit",
                "locality_name": loc["name"],
                "city": loc["city"],
                "ward": loc["ward"],
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "reporting_window": "Active 24-Hour Community Window & Historical Baseline",
                "total_observations_recorded": total_reports,
                "metrics": {
                    "reported_availability_share": f"{(avail_count / total_reports * 100.0):.1f}%" if total_reports else "0%",
                    "reported_no_water_share": f"{(no_water_count / total_reports * 100.0):.1f}%" if total_reports else "0%",
                    "low_pressure_frequency": f"{(low_pressure_count / total_reports * 100.0):.1f}%" if total_reports else "0%",
                    "supply_delay_frequency": f"{(delayed_count / total_reports * 100.0):.1f}%" if total_reports else "0%"
                },
                "community_confidence": {
                    "level": conf["level"],
                    "label": conf["label"],
                    "score": f"{conf['score']}/100",
                    "explanation": conf["reasons"]
                },
                "fingerprint_status": fp.get("status"),
                "common_delay_periods": fp.get("common_delay_periods"),
                "active_disruption_warning": alert,
                "legal_and_methodological_disclaimer": (
                    "This report card is derived from voluntary, crowd-contributed community observations. "
                    "It is designed for neighbourhood preparedness and transparency. "
                    "PAANIPULSE does not guarantee official municipal pipe telemetry or replace authoritative notices from local water boards."
                )
            }
            return build_response(200, report_card)

        # 9. Admin Moderation: POST /admin/moderate
        if raw_path == "/admin/moderate" and http_method == "POST":
            raw_body = event.get("body", "{}")
            payload = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
            passcode = payload.get("adminPasscode", "")
            # Simple demonstration secret protection
            if passcode != "paanipulse-admin-2026":
                return build_response(401, {"error": "Unauthorized administrative action."})

            report_id = payload.get("reportId")
            flag = payload.get("flag", True)
            success = db.flag_report(report_id, flagged=flag)
            return build_response(200, {
                "success": success,
                "report_id": report_id,
                "status": "flagged_hidden" if flag else "active"
            })

        return build_response(404, {"error": f"Endpoint {raw_path} not found."})

    except Exception as e:
        logger.error(f"Internal server error: {e}", exc_info=True)
        return build_response(500, {
            "error": "Internal server processing error.",
            "message": "An unexpected error occurred while processing the water intelligence request."
        })
