# PAANIPULSE — Field Validation Framework & Demonstration Evidence
## Techfest 2026–27 Campus to Cloud Hackathon sponsored by AWS

---

### 1. Locality Profile Catalog

| Locality ID | Locality Name | City & State | Municipal Ward | Baseline Status | Active Observations |
|---|---|---|---|---|---|
| `mumbai-bandra-west` | Bandra West | Mumbai, Maharashtra | H-West Ward (MCGM) | Established Baseline | 13 reports (Active Disruption Scenario) |
| `mumbai-powai` | Powai / Hiranandani | Mumbai, Maharashtra | S Ward (MCGM) | Established Baseline | 8 reports (Nominal Flow Scenario) |
| `pune-kothrud` | Kothrud | Pune, Maharashtra | Kothrud-Bavdhan (PMC) | Developing Baseline | 4 reports (Intermittent Scenario) |
| `bengaluru-whitefield`| Whitefield | Bengaluru, Karnataka | Mahadevapura (BWSSB) | Developing Baseline | 3 reports (Low Pressure Scenario) |
| `delhi-dwarka` | Dwarka Sector 10 | New Delhi, Delhi | DJB Zone 2 | Fresh / Unverified | 0 reports (Pristine Cold-Start State) |

---

### 2. Demonstration Baseline Scenarios

#### Scenario A: Active Supply Disruption (Bandra West)
- **Normal Diurnal Expectation:** Morning availability share is historically 85.0%.
- **Current Observation Stream:** In the last 4 hours, 5 independent reports submitted:
  - 3x `NO_WATER` (pressure: `NONE`)
  - 2x `DELAYED_SUPPLY` (pressure: `TRICKLE`)
- **System Detection:** Disruption rate = 100% (&ge; 50% threshold) with 5 independent devices.
- **Triggered Output:** Explainable Alert: *“Community reports indicate a possible supply disruption. Reported availability dropped significantly below the 85.0% typical baseline.”*

#### Scenario B: Healthy Baseline (Powai)
- **Normal Diurnal Expectation:** Morning availability share is historically 92.0%.
- **Current Observation Stream:** 4 recent submissions all reporting `WATER_AVAILABLE` with normal pressure.
- **System Detection:** Nominal conditions confirmed. Confidence = 82/100 (`Stronger community signal`).

#### Scenario C: Pristine Cold-Start Locality (Dwarka Sector 10)
- **Current Reports:** 0
- **System Detection:** Returns `INSUFFICIENT_DATA`. Transparently informs the user: *“Not enough verified community history yet. Locality baseline is developing.”* No false alerts generated.

---

### 3. Data Integrity & Ethical Disclosure
All sample scenarios are cleanly segregated in code using the `is_demo_data: true` flag. Real community submissions overwrite and dynamically refine baseline calculations without altering underlying civic truthfulness.

