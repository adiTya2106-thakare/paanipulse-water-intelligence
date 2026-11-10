# PAANIPULSE (पानीय पल्स)
### India's Community-Powered Water Intelligence & Early Disruption Detection Network
**Tagline:** *“Know your neighbourhood's water situation before the tap runs dry.”*

[![Hackathon](https://img.shields.io/badge/Techfest_2026--27-Campus_to_Cloud_(AWS)-orange.svg)](https://techfest.org)
[![AWS Serverless](https://img.shields.io/badge/AWS-API_Gateway_|_Lambda_|_DynamoDB-blue.svg)](https://aws.amazon.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-16_Passed_100%25-brightgreen.svg)]()

---

## 🌊 The Problem We Solve
In urban and peri-urban India, municipal tap water is intermittent, scheduled for only 1 to 4 hours daily. When supply is delayed, arrives with low pressure, or fails completely, residents face acute uncertainty:
- *“Did the society pump breaker trip, or is the entire municipal ward facing a burst main?”*
- *“Is tanker supply needed today, or will supply arrive in 45 minutes?”*

Residents currently rely on scattered WhatsApp messages, unverified phone calls, and word-of-mouth rumours.

**PAANIPULSE** transforms informal neighbourhood chatter into a transparent, explainable civic water-intelligence platform. It enables residents to corroborate observations, view diurnal supply fingerprints, and receive early warnings when conditions deviate from established baselines.

> **Civic Data Integrity Principle:** PAANIPULSE aggregates voluntary community observations. It clearly distinguishes crowd signals from municipal pipeline telemetry and never hallucinates official government announcements.

---

## ✨ Core Differentiating Features

### 1. Neighbourhood Water Fingerprint (Feature A)
Constructs a locality-specific historical baseline across diurnal windows:
- **Morning (06:00 - 10:00)**
- **Midday (10:00 - 16:00)**
- **Evening (16:00 - 21:00)**
- **Night (21:00 - 06:00)**

Calculates reported availability share, low-pressure frequency, and common delay periods. If fewer than 12 reports exist, it displays:
> *“Not enough verified community history yet. This locality's Water Fingerprint is developing.”*

### 2. Transparent Community Signal Confidence (Feature B)
A deterministic 100-point composite scoring model:
- **Reporter Diversity (30 pts):** Unique cryptographic device tokens.
- **Recency Decay (35 pts):** Observations &le; 2h weighted 1.0; 2-6h weighted 0.7; 6-12h weighted 0.4; &gt; 12h weighted 0.15.
- **Concordance Agreement (35 pts):** Neighbour agreement percentage.

Levels: **Low confidence (0-39)**, **Developing signal (40-64)**, **Stronger community signal (65-100)**.

### 3. Explainable Disruption Early-Warning (Feature C)
When an established baseline indicates typical availability (&ge; 60%) during a time window, but recent 4-hour reports show &ge; 50% disruption ("No Water" or "Delayed Supply") across &ge; 2 independent devices, PAANIPULSE generates an explainable alert:
> *“Community reports indicate a possible supply disruption.”* (Never claims an official outage).

### 4. Locality Pulse Map & Spatial Explorer (Feature D)
Privacy-preserving locality explorer with ward centroids (Mumbai, Pune, Bengaluru, New Delhi). Zero household or building addresses exposed.

### 5. Smart Water Report Timeline (Feature E)
Chronological stream with multi-criteria filtering (Available, Low Pressure, Delayed, No Water), keyword search, and explicit `[DEMO DATA]` tags on synthetic baseline records.

### 6. Evidence-Based Locality Report (Feature G)
Downloadable / printable PDF audit report card containing metrics, confidence explanations, and mandatory civic disclaimers.

### 7. Anti-Manipulation & Data Integrity Layer (Feature H)
- Anonymous device tokens with rate-limiting (max 3 submissions per 15 minutes).
- Server-side timestamping.
- HTML tag stripping against XSS.
- Password-protected administrator moderation console (`POST /admin/moderate`).

---

## ☁️ AWS Cloud Architecture

```
                                  [ Indian Residents / Mobile Browsers ]
                                                    │
                                                    ▼
                                  [ AWS Amplify / CloudFront CDN ]
                                                    │
                                                    ▼
                                    [ Amazon API Gateway (HTTP API) ]
                                      (CORS, Throttling, Routing)
                                                    │
                                                    ▼
                                   [ AWS Lambda (Python 3.12 Engine) ]
                                    ├── Confidence Scoring Engine
                                    ├── Water Fingerprint Analyzer
                                    └── Explainable Disruption Detector
                                                    │
                                                    ▼
                                     [ Amazon DynamoDB (On-Demand) ]
                                     Table: PaanipulseReports
                                     Partition Key: localityId (S)
                                     Sort Key: timestamp#reportId (S)
```

### Cost Assessment (Free Tier Eligible)
- **DynamoDB:** Pay-per-request billing (25 GB free storage under AWS Free Tier = **$0.00**).
- **AWS Lambda:** 1 Million free requests/month = **$0.00**.
- **API Gateway:** 1 Million free API calls/month = **$0.00**.

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Cloud API health status, runtime version, and database mode |
| `GET` | `/localities` | List of supported localities, wards, coordinates, and live stats |
| `GET` | `/summary?localityId=...` | Summary stats, availability share, confidence rating, active alert |
| `GET` | `/reports?localityId=...` | Chronological filtered timeline of verified observations |
| `POST` | `/reports` | Submit community observation (rate-limited, validated) |
| `GET` | `/fingerprint?localityId=...` | Diurnal time-window historical profile and delay trends |
| `GET` | `/alerts?localityId=...` | Explainable anomaly disruption alerts |
| `GET` | `/report-card?localityId=...` | Evidence-based audit report card for printable export |
| `POST` | `/admin/moderate` | Admin moderation to flag/hide spam (passcode protected) |

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Run the Backend API Server
```bash
cd backend
python server.py
# Server runs at http://127.0.0.1:5000 mirroring AWS Lambda + API Gateway
```

### 2. Run the Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
# App opens at http://localhost:5173
```

### 3. Run Automated Tests
```bash
# Backend unit & algorithm tests
python -m unittest tests/test_backend.py

# End-to-end integration tests
python -m unittest tests/test_integration.py
```

---

## ☁️ AWS Deployment (Automated)

When AWS credentials are configured (`aws configure` or environment variables):

```powershell
# Set AWS credentials (if not already set via aws configure)
$env:AWS_ACCESS_KEY_ID="your_key"
$env:AWS_SECRET_ACCESS_KEY="your_secret"
$env:AWS_DEFAULT_REGION="ap-south-1"

# Run automated zero-click AWS deployment
cd backend
python deploy_aws.py
```

The script automatically:
1. Provisions the DynamoDB table `PaanipulseReports` with on-demand capacity.
2. Creates the least-privilege IAM execution role `PaanipulseLambdaExecutionRole`.
3. Packages and deploys the Lambda serverless function `PaanipulseCoreApi`.
4. Creates the Amazon API Gateway HTTP API and configures CORS and `$default` routes.
5. Emits the live public API endpoint URL.

---

## 📂 Hackathon Submission Structure
The submission package is organized in accordance with Techfest 2026–27 guidelines:

```
PAANIPULSE_Techfest_2026_27_Submission/
├── 01_Idea_Brief/
│   ├── PAANIPULSE_Idea_Brief.md
│   └── PAANIPULSE_Idea_Brief.html (Printable PDF ready)
├── 02_AWS_Build_Summary/
│   ├── PAANIPULSE_AWS_Build_Summary.md
│   └── PAANIPULSE_AWS_Build_Summary.html (Printable PDF ready)
├── 03_Live_Demo/
│   ├── LIVE_APPLICATION_URL.txt
│   ├── DEMO_VIDEO_SCRIPT.md (Timed under 3 minutes)
│   └── RECORDING_GUIDE.md
├── 04_Source_Code/
│   └── GITHUB_REPOSITORY_URL.txt
├── 05_Architecture/
│   ├── ARCHITECTURE.md
│   └── AWS_Architecture_Diagram.svg
├── 06_Evidence/
│   ├── TEST_REPORT.md (All 16 unit + 4 integration tests)
│   ├── RESIDENT_INTERVIEW_PROTOCOL.md
│   └── VALIDATION_DATA.md
└── Finals_Prep/
    └── FINALS_PITCH_AND_JUDGE_QA.md (3-min pitch + 10 tough Q&As)
```

---

## 🛡️ License
Released under the [MIT License](LICENSE). Built for the **Techfest 2026–27 Campus to Cloud Hackathon sponsored by AWS**.

