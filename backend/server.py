"""
PAANIPULSE - Local Development & Test Server
Emulates AWS API Gateway v2 HTTP API by routing HTTP requests
directly to the AWS Lambda handler `lambda_handler(event, context)`.
"""
import sys
import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lambda_function import lambda_handler

PORT = int(os.environ.get("PORT", 5000))

class LambdaProxyHandler(BaseHTTPRequestHandler):
    def _send_lambda_response(self, result):
        status_code = result.get("statusCode", 200)
        headers = result.get("headers", {})
        body = result.get("body", "")

        self.send_response(status_code)
        for k, v in headers.items():
            self.send_header(k, v)
        self.end_headers()

        if isinstance(body, str):
            self.wfile.write(body.encode("utf-8"))
        elif isinstance(body, bytes):
            self.wfile.write(body)

    def do_OPTIONS(self):
        parsed = urlparse(self.path)
        event = {
            "httpMethod": "OPTIONS",
            "rawPath": parsed.path,
            "path": parsed.path,
            "headers": dict(self.headers),
            "queryStringParameters": {}
        }
        res = lambda_handler(event, None)
        self._send_lambda_response(res)

    def do_GET(self):
        parsed = urlparse(self.path)
        query_dict = {k: v[0] if len(v) == 1 else v for k, v in parse_qs(parsed.query).items()}
        
        event = {
            "httpMethod": "GET",
            "rawPath": parsed.path,
            "path": parsed.path,
            "headers": dict(self.headers),
            "queryStringParameters": query_dict,
            "requestContext": {
                "http": {"method": "GET", "path": parsed.path},
                "identity": {"sourceIp": self.client_address[0]}
            }
        }
        res = lambda_handler(event, None)
        self._send_lambda_response(res)

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b"{}"
        body_str = body_bytes.decode("utf-8")

        event = {
            "httpMethod": "POST",
            "rawPath": parsed.path,
            "path": parsed.path,
            "headers": dict(self.headers),
            "body": body_str,
            "requestContext": {
                "http": {"method": "POST", "path": parsed.path},
                "identity": {"sourceIp": self.client_address[0]}
            }
        }
        res = lambda_handler(event, None)
        self._send_lambda_response(res)

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"[PAANIPULSE Local API] {self.address_string()} - {format%args}\n")

def run():
    server_address = ("127.0.0.1", PORT)
    httpd = HTTPServer(server_address, LambdaProxyHandler)
    print(f"🚀 PAANIPULSE Local API Gateway running at http://127.0.0.1:{PORT}")
    print(f"👉 Mirroring AWS Lambda function with instant hot-reload and zero cloud dependencies.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping PAANIPULSE Local Gateway...")
        httpd.server_close()

if __name__ == "__main__":
    run()
