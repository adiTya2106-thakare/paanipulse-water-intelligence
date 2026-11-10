# PAANIPULSE — Idea Brief
## Techfest 2026–27 Campus to Cloud Hackathon sponsored by AWS
**Round 1 Official Submission Deliverable**

---

### 1. Project Name
**PAANIPULSE (पानीय पल्स)**

### 2. Tagline
*“Know your neighbourhood's water situation before the tap runs dry.”*

---

### 3. Problem Statement
In Indian urban and peri-urban habitats, municipal water supply is intermittent, operating for only 45 minutes to 3 hours a day, often with unpredictable timing and fluctuating pressure. When water fails to flow, residents face immediate anxiety:
- Is the disruption limited to my building's internal plumbing/pump breaker, or is the whole municipal ward affected?
- Should our household book a private water tanker immediately, or will supply arrive within the hour?
- Are nearby streets receiving water, meaning a localized distribution valve issue?

Existing municipal helplines are reactive, congested, and seldom provide real-time hyper-local granularity.

---

### 4. Indian User Context
Over 350 million urban residents across Indian tier-1 and tier-2 cities (Mumbai, Bengaluru, Pune, Delhi NCR, Chennai, Hyderabad) live with scheduled municipal rationing. In high-density areas, residents depend on shared underground sumps and rooftop overhead tanks. 

When supply is delayed, communication occurs haphazardly through informal WhatsApp apartment groups, desperate phone calls to watchmen, or shouting across balconies. These fragmented signals create panic, unnecessary tanker hoarding, and wasted electricity from running dry booster pumps.

---

### 5. Target Users
1. **Urban Households & Resident Welfare Associations (RWAs):** Apartment residents, housing society secretaries, and chawl/mohalla committees who need to schedule daily chores, tank filling, and booster pump cycles.
2. **Local Businesses & Small Establishments:** Chai stalls, small eateries, laundromats, and clinics dependent on predictable water supply.
3. **Civic Water Tanker Dispatchers:** Locality coordinators managing community water delivery during genuine disruptions.

---

### 6. Existing Gap
| Existing Approach | Limitation |
|---|---|
| **Informal WhatsApp Groups** | Unverified hearsay, emotional rumors, no historical context, repetitive panic questions. |
| **Municipal Helplines** | Busy telephone lines, delayed official circulars, ward-level rather than street-level resolution. |
| **IoT Pipe Sensors** | Extremely expensive to deploy across thousands of private residential pipes; vulnerable to vandalism, silt clogging, and power cuts. |

---

### 7. Proposed Solution: PAANIPULSE
PAANIPULSE is a lightweight, mobile-first community water intelligence network that organizes voluntary resident observations into transparent, explainable neighbourhood signals.

Residents report whether water is flowing, delayed, or running with low pressure in under 15 seconds. PAANIPULSE aggregates these observations, compares them against a diurnal **Neighbourhood Water Fingerprint**, evaluates a transparent **Community Signal Confidence**, and generates **Explainable Disruption Early-Warnings**.

---

### 8. How It Works
```
1. Resident Observes Tap Flow
               │
               ▼
2. Quick 15-Second Mobile Submission (Locality + Flow Condition + Pressure)
               │
               ▼
3. Anti-Manipulation Validation & Cryptographic Device Hashing
               │
               ▼
4. AWS Serverless Engine (Lambda + DynamoDB)
   ├── Updates Locality Reported Availability Share
   ├── Computes 100-Point Transparent Confidence Rating
   └── Checks Deviation Against Diurnal Baseline Fingerprint
               │
               ▼
5. Real-Time Community Dashboard & Preparedness Guidance
```

---

### 9. Unique Differentiating Features
1. **Neighbourhood Water Fingerprint:** Historical availability profiling across diurnal intervals (Morning, Midday, Evening, Night). Cleanly flags when a baseline is still developing.
2. **Community Signal Confidence:** Transparent 100-point composite score based on reporter diversity (30 pts), recency decay (35 pts), and concordance agreement (35 pts). Explains exactly *why* a signal is rated Low, Developing, or Stronger.
3. **Explainable Early-Warning Anomaly Detection:** Alerts residents when current flow drops &ge; 50% below historical baseline, with plain-language reasons. Never fabricates "official outage" claims.
4. **Locality Pulse Map:** Privacy-preserving visual explorer using municipal ward centroids.
5. **Smart Report Timeline:** Chronological observation feed with multi-criteria filters and explicit `[DEMO DATA]` demarcation for synthetic baseline testing.
6. **Evidence-Based Locality Report Card:** Instant downloadable/printable audit document for RWAs and ward councillors.
7. **Anti-Manipulation Integrity Layer:** Anonymous device token rate-limiting (max 3 reports / 15 mins), server-side timestamp validation, and XSS sanitization.

---

### 10. Technical Architecture
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons (responsive, mobile-first, high-contrast civic theme).
- **Backend:** AWS Lambda (Python 3.12 Serverless) with Amazon API Gateway (HTTP API v2).
- **Database:** Amazon DynamoDB (On-Demand PAY_PER_REQUEST billing for zero idle cost).
- **Deployment & Hosting:** AWS Amplify / S3 Edge Hosting with global CloudWatch logging.

---

### 11. AWS Services Actually Used
1. **Amazon API Gateway (HTTP API):** Manages CORS preflight, route dispatching, request throttling, and public HTTPS ingress.
2. **AWS Lambda:** Hosts the serverless Python 3.12 execution engine running statistical confidence calculations, anomaly detection, and data validation.
3. **Amazon DynamoDB:** Stores immutable community observation records and locality catalogs with composite primary keys (`localityId`, `timestamp#reportId`).
4. **Amazon CloudWatch:** Monitors invocation latency, error counts, and serverless logs.
5. **AWS Amplify Hosting:** Serves the static SPA distribution with CDN caching.

---

### 12. Innovation & Originality
Unlike traditional complaint portals that treat citizen submissions as passive feedback tickets, PAANIPULSE converts crowd observations into an **active early-warning telemetry layer**. By computing time-windowed availability baselines (Water Fingerprints) without requiring million-dollar hardware sensors, PAANIPULSE delivers immediate civic utility using the devices citizens already own.

---

### 13. Expected Social Impact (Bharat Impact: 30%)
- **Prevents Panic & Tanker Price Gouging:** Transparent signals prevent private tanker syndicates from artificially inflating prices during temporary building-level valve delays.
- **Energy Conservation:** Prevents residential societies from running high-voltage booster pumps dry, avoiding motor burnout and energy waste.
- **Equitable Distribution:** Provides evidence-based report cards that community leaders can present to local municipal corporators to highlight systemic low-pressure pockets.

---

### 14. Privacy & Trust Considerations
- **Zero Exact Address Storage:** Submissions are strictly tied to locality and municipal ward boundaries; door numbers, flat numbers, and phone numbers are never collected.
- **Honest Civic Boundaries:** Clearly labelled as community-submitted observations. Never misleads citizens into believing it is an official government pipe sensor.
- **Synthetic Data Labeling:** All demonstration datasets are clearly watermarked as `DEMO DATA`.

---

### 15. Limitations
1. Dependent on voluntary community participation in the locality.
2. Community observations cannot diagnose internal pipe corrosion or deep underground leaks directly.
3. Signal confidence is inherently lower during initial weeks when a locality's historical baseline is developing.

---

### 16. Future Scope
- **Multi-lingual Voice IVR:** Enable reporting via toll-free phone calls for non-smartphone users in regional Indian languages.
- **Municipal Open Data Ingestion:** Ingest scheduled maintenance circulars from municipal water boards (MCGM, DJB, BWSSB) to corroborate community alerts with official scheduled shut-downs.
- **Rainwater Harvesting & Ground Recharge Tracking:** Expand the locality fingerprint to track seasonal groundwater replenishment.

---

### 17. Repository & Deliverables
- **GitHub Repository:** Publicly available with full source code, deployment scripts, and automated test suite.
- **Live AWS Endpoint:** Amazon API Gateway + Lambda + DynamoDB serverless backend.
- **Tested Test Suite:** 16 Unit & Algorithm tests + 4 End-to-end Integration tests (100% pass rate).
