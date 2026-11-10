# PAANIPULSE — Technical Architecture & Cloud System Design
## Techfest 2026–27 Campus to Cloud Hackathon sponsored by AWS

---

### 1. Architectural Philosophy
1. **Zero-Idle-Cost Serverless:** No standing EC2 instances, containers, or provisioned IOPS incurring hourly charges.
2. **Deterministic & Explainable:** Civic intelligence algorithms must be mathematically transparent and auditable by citizens and municipal officials.
3. **Data Integrity & Anti-Tampering:** Defense against bots and duplicate flood attacks via cryptographic tokenization and rate limiting.
4. **Privacy-Preserving Civic Aggregation:** Locality-level centroids only; no private household address exposure.

---

### 2. Request Lifecycle & End-to-End Data Flow

#### Step 1: Observation Submission (`POST /reports`)
1. Citizen fills out flow status and pressure level on their phone.
2. The browser automatically attaches an anonymous cryptographic client token `usr-[random-uuid]`.
3. An HTTPS `POST` request hits **Amazon API Gateway HTTP API v2**.
4. API Gateway handles CORS validation (`Access-Control-Allow-Origin: *`) and routes the request to **AWS Lambda**.
5. The Lambda function:
   - Validates the JSON schema.
   - Strips any HTML tags from notes (preventing XSS).
   - Validates token rate limits (max 3 reports per 15 mins).
   - Applies an immutable server-side UTC timestamp.
   - Executes DynamoDB `PutItem` writing to `PaanipulseReports`.
   - Re-evaluates locality confidence and disruption status.
   - Returns a `201 Created` HTTP response with updated locality metrics.

#### Step 2: Dashboard Query (`GET /summary?localityId=...`)
1. The dashboard requests the latest locality summary.
2. AWS Lambda issues an optimized DynamoDB `Query` on the `localityId` partition key for the active 24-hour window.
3. Lambda executes the **Confidence Engine**:
   - Calculates distinct reporter device count.
   - Applies exponential time decay to older observations.
   - Evaluates agreement ratio among submitted statuses.
4. Lambda checks the **Neighbourhood Water Fingerprint**:
   - If historical observations < 12, returns `DEVELOPING`.
   - If established baseline exists and current 4-hour disruption rate &ge; 50%, constructs an explainable early-warning alert.
5. Emits the aggregated JSON payload with HTTP caching headers.

---

### 3. Fault Tolerance & Edge Cases

| Edge Case | System Response |
|---|---|
| **Zero reports submitted yet (e.g. Dwarka)** | Returns status `INSUFFICIENT_DATA`. Never fabricates baseline or fake alerts. |
| **Single user attempting flood/spam** | Rate-limiter cuts off device at 3 submissions per 15 minutes with HTTP `429 Too Many Requests`. |
| **AWS Region Outage or DynamoDB throttle** | Fail-safe in-memory caching layer ensures read queries continue gracefully. |
| **Conflicting neighbour reports (50% water, 50% dry)** | Transparent confidence indicator drops to `Developing` with an explanation: *"Mixed observations received across street sectors."* |

---

### 4. DynamoDB Cost & Query Optimization

| Operation | Query Type | Average Latency | Free Tier Cost |
|---|---|---|---|
| Query Locality Summary | KeyCondition on Partition Key | 8–15 ms | $0.00 |
| Insert Citizen Report | PutItem with unique Sort Key | 10–20 ms | $0.00 |
| View Filtered Timeline | Query with Limit 50 | 12–25 ms | $0.00 |
| Table Scans | **Zero Table Scans** | N/A | $0.00 |

