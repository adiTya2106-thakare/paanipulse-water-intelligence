"""
PAANIPULSE - End-to-End Integration HTTP Server Test
Runs the local server in a separate thread and makes actual HTTP client calls.
"""
import sys
import os
import unittest
import threading
import time
import json
import urllib.request
import urllib.error

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from server import LambdaProxyHandler
from http.server import HTTPServer

TEST_PORT = 5099

class TestIntegrationServer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.httpd = HTTPServer(("127.0.0.1", TEST_PORT), LambdaProxyHandler)
        cls.server_thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.5)

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()

    def test_http_health(self):
        url = f"http://127.0.0.1:{TEST_PORT}/health"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data["status"], "healthy")
            self.assertIn("service", data)

    def test_http_cors_preflight(self):
        url = f"http://127.0.0.1:{TEST_PORT}/reports"
        req = urllib.request.Request(url, method="OPTIONS")
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            self.assertEqual(resp.headers.get("Access-Control-Allow-Origin"), "*")
            self.assertIn("GET, POST, OPTIONS", resp.headers.get("Access-Control-Allow-Methods"))

    def test_http_summary_and_fingerprint(self):
        url = f"http://127.0.0.1:{TEST_PORT}/summary?localityId=mumbai-bandra-west"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data["locality"]["id"], "mumbai-bandra-west")
            self.assertIn("confidence", data)

        fp_url = f"http://127.0.0.1:{TEST_PORT}/fingerprint?localityId=mumbai-bandra-west"
        with urllib.request.urlopen(urllib.request.Request(fp_url)) as resp:
            self.assertEqual(resp.status, 200)
            fp_data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(fp_data["status"], "ESTABLISHED_BASELINE")

    def test_http_report_card(self):
        url = f"http://127.0.0.1:{TEST_PORT}/report-card?localityId=mumbai-bandra-west"
        with urllib.request.urlopen(urllib.request.Request(url)) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertIn("metrics", data)
            self.assertIn("legal_and_methodological_disclaimer", data)

if __name__ == "__main__":
    unittest.main()

