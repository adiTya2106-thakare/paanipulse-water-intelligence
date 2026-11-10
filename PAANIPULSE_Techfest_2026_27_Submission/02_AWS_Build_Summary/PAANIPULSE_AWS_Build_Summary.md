# PAANIPULSE — AWS Build Summary
## Techfest 2026–27 Campus to Cloud Hackathon sponsored by AWS
**Round 1 Official Technical Build Deliverable**

---

### 1. Architecture Overview
PAANIPULSE is built on a 100% serverless, event-driven, cost-conscious AWS cloud architecture designed for high availability, zero idle costs, and instant scalability during morning peak water-supply hours in Indian cities.

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|        React 19 + TypeScript + Vite Single-Page Application (SPA)       |
|            Served via AWS Amplify Hosting / CloudFront Edge             |
+-------------------------------------------------------------------------+
                                     │
                                     ▼ HTTPS (JSON REST API)
+-------------------------------------------------------------------------+
|                             GATEWAY LAYER                               |
|                     Amazon API Gateway (HTTP API v2)                    |
|          - Route dispatching: /health, /localities, /summary...          |
|          - Automatic CORS Handling (Preflight OPTIONS 200)              |
|          - Throttling: 100 req/sec burst limit                          |
+-------------------------------------------------------------------------+
                                     │
                                     ▼ AWS_PROXY Integration
+-------------------------------------------------------------------------+
|                             COMPUTE LAYER                               |
|                     AWS Lambda (Python 3.12 Runtime)                    |
|      Function: PaanipulseCoreApi (Memory: 256MB, Timeout: 15s)          |
|      Modules:                                                           |
|        ├── lambda_function.py (Router & Request Dispatcher)             |
|        ├── models.py (Schema Validation & Sanitization)                 |
|        ├── algorithms.py (Confidence Scoring, Fingerprint, Anomaly)     |
|        └── database.py (DynamoDB Adapter & Fail-Safe Fallback)          |
+-------------------------------------------------------------------------+
                                     │
                                     ▼ boto3 IAM Least-Privilege
+-------------------------------------------------------------------------+
|                             STORAGE LAYER                               |
|                    Amazon DynamoDB (NoSQL Key-Value)                    |
|                    Table: PaanipulseReports                             |
|          - Partition Key (HASH): localityId (String)                    |
|          - Sort Key (RANGE): timestamp#reportId (String)                |
|          - Capacity Mode: PAY_PER_REQUEST (On-Demand)                   |
|          - Point-in-Time Recovery: Enabled                              |
+-------------------------------------------------------------------------+
                                     │
                                     ▼ Automated Log Streaming
+-------------------------------------------------------------------------+
|                           OBSERVABILITY LAYER                           |
|                           Amazon CloudWatch                             |
|          - /aws/lambda/PaanipulseCoreApi Log Group                      |
|          - 14-day retention to prevent storage accrual                  |
+-------------------------------------------------------------------------+
```

---

### 2. AWS Services Implemented vs Proposed

| AWS Service | Implementation Status | Exact Role in PAANIPULSE |
|---|---|---|
| **Amazon API Gateway (HTTP API)** | **Implemented & Tested** | Ingress API gateway, CORS preflight management, payload routing to Lambda. |
| **AWS Lambda** | **Implemented & Tested** | Serverless business logic in Python 3.12: confidence scoring, baseline deviation, rate limiting. |
| **Amazon DynamoDB** | **Implemented & Tested** | High-throughput, low-latency NoSQL table for storing crowd reports and query by locality/time. |
| **Amazon CloudWatch** | **Implemented & Tested** | Ingestion of Lambda stdout/stderr logs, execution metrics, and latency tracking. |
| **AWS Amplify Hosting** | **Configured & Deployment Ready** | Global CDN-accelerated hosting of the compiled React/Vite web application. |
| **Amazon SNS (SMS Alerts)** | *Proposed Future Enhancement* | For dispatching urgent SMS alerts to RWA secretaries when disruptions are corroborated. |
| **Amazon QuickSight** | *Proposed Future Enhancement* | For municipal corporator dashboards across multi-city wards. |

---

### 3. Database Design (Amazon DynamoDB)

#### Table Name: `PaanipulseReports`
- **Billing Mode:** `PAY_PER_REQUEST` (Zero fixed hourly cost; charges only per read/write request).
- **Partition Key (`HASH`):** `localityId` (e.g. `mumbai-bandra-west`, `mumbai-powai`, `pune-kothrud`).
- **Sort Key (`RANGE`):** `timestamp#reportId` (e.g. `2026-11-10T08:30:00Z#rep-a1b2c3d4e5`).

#### Schema Structure (JSON Attribute Representation)
```json
{
  "localityId": "mumbai-bandra-west",
  "timestamp#reportId": "2026-11-10T08:30:00Z#rep-7f8e9d1a2b",
  "report_id": "rep-7f8e9d1a2b",
  "locality_name": "Bandra West",
  "observation_type": "NO_WATER",
  "pressure_level": "NONE",
  "notes": "Morning municipal supply has not arrived in Pali Hill.",
  "timestamp": "2026-11-10T08:30:00Z",
  "reporter_token": "usr-8a9b0c1d",
  "client_ip_hash": "4a7f...e3",
  "is_demo_data": false,
  "flagged": false
}
```

#### Why This Key Design Avoids Table Scans
By compounding `localityId` as the Partition Key and prefixing the Sort Key with ISO-8601 UTC `timestamp`, all dashboard queries use high-efficiency DynamoDB `Query` operations:
- Querying the last 24 hours of reports for a locality requires only:
  `KeyConditionExpression: localityId = :locId AND timestamp#reportId >= :yesterday`
- This completely avoids expensive, slow full-table scans.

---

### 4. API Design & Endpoint Specifications

| Method | Route | Query/Body Params | Response Sample | Status Code |
|---|---|---|---|---|
| `GET` | `/health` | None | `{"status": "healthy", "service": "PAANIPULSE Cloud API", "version": "1.0.0"}` | `200 OK` |
| `GET` | `/localities` | None | `{"localities": [{"id": "mumbai-bandra-west", "total_reports": 13, ...}]}` | `200 OK` |
| `GET` | `/summary` | `localityId=...` | `{"reported_availability_share": 85.0, "confidence": {...}, "alert": null}` | `200 OK` |
| `GET` | `/reports` | `localityId=...&limit=50` | `{"locality_id": "...", "count": 12, "reports": [...]}` | `200 OK` |
| `POST` | `/reports` | JSON Body (see below) | `{"message": "Report submitted successfully.", "report": {...}}` | `201 Created` |
| `GET` | `/fingerprint`| `localityId=...` | `{"status": "ESTABLISHED_BASELINE", "window_profiles": {...}}` | `200 OK` |
| `GET` | `/alerts` | `localityId=...` (optional) | `{"alerts": [{"title": "Possible supply disruption", ...}]}` | `200 OK` |
| `GET` | `/report-card`| `localityId=...` | Formatted evidence audit summary for printable PDF export | `200 OK` |
| `POST`| `/admin/moderate` | `{"adminPasscode": "...", "reportId": "...", "flag": true}` | `{"success": true}` | `200 OK` / `401` |

---

### 5. Automated Deployment Workflow

The project contains two deployment paths:

#### A. Automated Python Cloud Provisioner (`deploy_aws.py`)
A single command (`python deploy_aws.py`) uses `boto3` to:
1. Verify caller identity via `sts:GetCallerIdentity`.
2. Provision the DynamoDB table `PaanipulseReports`.
3. Create the least-privilege IAM role `PaanipulseLambdaExecutionRole`.
4. Bundle Lambda code and dependencies into a lightweight zip in memory.
5. Deploy the Lambda function and configure environment variables.
6. Create the Amazon API Gateway HTTP API and link the Lambda proxy integration.
7. Automatically write the emitted live API endpoint into `frontend/src/config.ts`.

#### B. Declarative Infrastructure-as-Code (AWS SAM / CloudFormation)
`backend/template.yaml` defines the exact same stack using AWS Serverless Application Model (SAM) syntax for enterprise CI/CD pipelines:
```bash
sam build
sam deploy --guided
```

---

### 6. Security & Cost-Conscious Design

#### Least-Privilege IAM Policy
The Lambda execution role does not use broad administrative permissions (`AdministratorAccess`). It is strictly scoped to:
1. `AWSLambdaBasicExecutionRole` (CloudWatch stream write permissions only).
2. DynamoDB inline policy scoped solely to `arn:aws:dynamodb:*:*:table/PaanipulseReports` for `PutItem`, `GetItem`, `Query`, and `UpdateItem`.

#### Zero Hardcoded Credentials
- No AWS keys, passwords, or tokens are committed to source control.
- Git repository enforces strict `.gitignore` covering `.env`, `aws_credentials.json`, and credentials paths.

#### Cost Assessment Under AWS Free Tier
| Service | Free Tier Allowance | PAANIPULSE Usage | Estimated Cost |
|---|---|---|---|
| **DynamoDB** | 25 GB storage + 25 WCU / 25 RCU | ~10 MB storage + Pay-per-request | **$0.00** |
| **AWS Lambda** | 1,000,000 free requests/month | ~10,000 requests during demo | **$0.00** |
| **API Gateway** | 1,000,000 free API calls/month | ~10,000 calls during demo | **$0.00** |
| **Amplify / S3** | 5 GB storage + 15 GB bandwidth | ~50 MB web assets | **$0.00** |
| **Total Monthly Cost** | — | — | **$0.00 / month** |

---

### 7. Automated Testing & Verification
The codebase contains a full test suite with **100% pass rate**:
- **16 Unit & Algorithm Tests:** Verified schema validation, XSS sanitization, 100-point confidence scoring, developing fingerprint thresholding, explainable disruption detection, device rate-limiting, and admin gatekeeping.
- **4 End-to-End Integration Tests:** Verified real HTTP requests against live server with CORS preflight and JSON payload response validation.
