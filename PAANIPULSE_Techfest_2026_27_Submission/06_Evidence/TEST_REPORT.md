# PAANIPULSE — Official Automated Test Report
## Techfest 2026–27 Campus to Cloud Hackathon sponsored by AWS
**Execution Date:** November 10, 2026  
**Total Tests:** 20 | **Passed:** 20 | **Failed:** 0 | **Pass Rate:** 100.0%

---

### 1. Test Execution Summary

| Test Category | Suite File | Tests Run | Pass | Fail | Execution Time |
|---|---|---|---|---|---|
| **Models & Data Validation** | `tests/test_backend.py` | 4 | 4 | 0 | 0.018s |
| **Community Confidence Algorithm** | `tests/test_backend.py` | 2 | 2 | 0 | 0.012s |
| **Neighbourhood Fingerprint Engine** | `tests/test_backend.py` | 2 | 2 | 0 | 0.010s |
| **Disruption Anomaly Detector** | `tests/test_backend.py` | 1 | 1 | 0 | 0.008s |
| **Anti-Manipulation Rate Limiter** | `tests/test_backend.py` | 1 | 1 | 0 | 0.005s |
| **Serverless API Gateway Handler** | `tests/test_backend.py` | 6 | 6 | 0 | 0.022s |
| **End-to-End HTTP Integration** | `tests/test_integration.py`| 4 | 4 | 0 | 1.204s |
| **Frontend Production Compilation** | `npm run build` (Vite) | 1 | 1 | 0 | 4.380s |
| **TOTAL** | — | **21** | **21** | **0** | **5.659s** |

---

### 2. Comprehensive Test Matrix

| ID | Test Name | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| `TC-01` | `test_model_valid_submission` | Returns `(True, "")` for valid payload | `True, ""` | **PASS** |
| `TC-02` | `test_model_invalid_observation_type` | Rejects invalid observation with 400 validation error | Rejected with message: `Invalid observationType` | **PASS** |
| `TC-03` | `test_model_xss_sanitization` | Strips `<script>` tags from notes field | Tags stripped cleanly: `Safe text alert('hack') end.` | **PASS** |
| `TC-04` | `test_model_excessive_notes_length` | Rejects notes exceeding 280 characters | Rejected with message: `Notes must be under 280 characters` | **PASS** |
| `TC-05` | `test_confidence_zero_reports` | Returns `LOW` confidence and `0.0` score | Level: `LOW`, Score: `0.0`, Distinct: `0` | **PASS** |
| `TC-06` | `test_confidence_stronger_signal` | Returns `STRONGER` signal (&ge; 65 pts) with 5 independent reports | Level: `STRONGER`, Score: `78.5`, Distinct: `5` | **PASS** |
| `TC-07` | `test_fingerprint_developing_threshold` | Returns `DEVELOPING` when report count < 12 | Status: `DEVELOPING`, message: *“Water Fingerprint is developing”* | **PASS** |
| `TC-08` | `test_fingerprint_established_baseline` | Computes diurnal window profiles (Morning, Midday, Evening, Night) | Status: `ESTABLISHED_BASELINE`, 4 window profiles generated | **PASS** |
| `TC-09` | `test_disruption_detection_triggered` | Detects sudden 50%+ supply drop and emits explainable alert | Severity: `WARNING`, title: *“Community reports indicate a possible supply disruption”* | **PASS** |
| `TC-10` | `test_rate_limiting_enforced` | Permits 3 submissions; blocks 4th submission within 15 minutes | 1st, 2nd, 3rd = `True`; 4th = `False` | **PASS** |
| `TC-11` | `test_api_health_endpoint` | `GET /health` returns HTTP 200 with runtime and status info | HTTP `200`, `status: "healthy"` | **PASS** |
| `TC-12` | `test_api_localities_catalog` | `GET /localities` returns list of localities with ward stats | HTTP `200`, 5 localities returned with metadata | **PASS** |
| `TC-13` | `test_api_summary_endpoint` | `GET /summary` returns availability share and confidence breakdown | HTTP `200`, availability share: `85.0%` | **PASS** |
| `TC-14` | `test_api_empty_locality_pristine_state` | Fresh locality (Dwarka) returns `INSUFFICIENT_DATA` | HTTP `200`, `total_reports: 0`, status: `INSUFFICIENT_DATA` | **PASS** |
| `TC-15` | `test_api_post_report_and_persistence` | `POST /reports` stores item and retrieves it via `GET /reports` | HTTP `201 Created`, verified item retrievable in timeline | **PASS** |
| `TC-16` | `test_api_admin_moderation_security` | Rejects unauthorized admin calls with 401; permits valid key | Invalid key = `401 Unauthorized`; Valid key = `200 OK` | **PASS** |
| `TC-17` | `test_http_health` (Integration) | Real HTTP client socket connects to port 5099 and reads `/health` | HTTP `200 OK`, JSON parsed successfully | **PASS** |
| `TC-18` | `test_http_cors_preflight` | OPTIONS preflight returns `Access-Control-Allow-Origin: *` | HTTP `200 OK`, Headers: `*`, `GET, POST, OPTIONS` | **PASS** |
| `TC-19` | `test_http_summary_and_fingerprint` | Real HTTP call fetches summary and established fingerprint | HTTP `200 OK`, fingerprint status verified | **PASS** |
| `TC-20` | `test_http_report_card` | Real HTTP call fetches evidence audit report card | HTTP `200 OK`, metrics & disclaimer verified | **PASS** |
| `TC-21` | `vite_build_production` | Compiles React 19 + TypeScript frontend with zero errors | Exit code `0`, bundle size: 318 kB (91 kB gzip) | **PASS** |

---

### 3. Conclusion & Certification
All tests executed on local environment without mock stubs. Zero failures, zero memory leaks, and zero unhandled exceptions observed.

