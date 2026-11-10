# PAANIPULSE — Hackathon Demo Video Script
## Strict 3-Minute Limit (Target Duration: 2 Minutes 50 Seconds)
**Techfest 2026–27 Campus to Cloud Hackathon sponsored by AWS**

---

### Segment 1: The Everyday Problem (0:00 – 0:20) [20s]
**Visual on Screen:**
Opening title card, followed by images/clips of apartment water storage tanks, dry taps, and overflowing, chaotic WhatsApp apartment society chats asking *"Is water coming today?"*.

**Voiceover / Speaker:**
> *"Every morning across urban India, 350 million residents wake up asking the exact same question: 'Has water started coming in the taps today?' 
> Because municipal water is rationed for only 1 to 3 hours daily, whenever water is delayed or pressure is low, residents panic. Did the society pump trip, or is the entire municipal ward dry? 
> Today, people rely on informal WhatsApp rumors, frantic calls to watchmen, or shouting across balconies."*

---

### Segment 2: Introducing PAANIPULSE (0:20 – 0:40) [20s]
**Visual on Screen:**
Transition to the PAANIPULSE Web Application running live in the browser. Show logo, tagline, and city filter pills (Mumbai, Pune, Bengaluru, New Delhi).

**Voiceover / Speaker:**
> *"Meet PAANIPULSE — India's community-powered water intelligence and early disruption detection network. 
> Our tagline: 'Know your neighbourhood's water situation before the tap runs dry.'
> PAANIPULSE transforms scattered neighbour chatter into structured, explainable civic water intelligence — without requiring expensive IoT pipe sensors."*

---

### Segment 3: Live Application Demo & Report Submission (0:40 – 1:35) [55s]
**Visual on Screen:**
1. Screen recording of the live dashboard. Select **Bandra West, Mumbai**.
2. Click **“Report Water Status”**.
3. The sleek mobile modal opens.
4. Select *Locality: Bandra West*, *Observation: Delayed Supply*, *Pressure: Trickle*, add note: *“Taps only hissing air in Pali Hill”*.
5. Click **“Submit Water Observation”**.
6. Show instant feedback and live dashboard refresh.
7. Show that the new observation immediately appears on the **Smart Water Report Timeline**.

**Voiceover / Speaker:**
> *"Let's see it live. A resident opens PAANIPULSE on their smartphone. 
> Notice how clean, fast, and mobile-friendly the interface is. 
> In under fifteen seconds, they log an observation: water condition, observed pressure, and an optional note. 
> Notice our privacy guarantee: we never ask for flat numbers or exact door addresses. 
> When I hit submit, the report is securely transmitted to our AWS cloud backend with anti-tamper device tokens and server-validated timestamps.
> Immediately, the Smart Water Report Timeline updates, allowing neighbours to corroborate conditions in real time."*

---

### Segment 4: Water Fingerprint, Confidence & Early Disruption Detection (1:35 – 2:15) [40s]
**Visual on Screen:**
1. Focus on the **Community Signal Confidence** meter (showing 78/100, "Stronger community signal"). Expand the transparent breakdown.
2. Scroll to the **Neighbourhood Water Fingerprint** showing the diurnal bars (Morning, Midday, Evening, Night).
3. Highlight the **Disruption Early-Warning Banner** for Bandra West: *"Community reports indicate a possible supply disruption. What changed: Reported availability dropped significantly below the 85% typical baseline."*
4. Switch briefly to **Dwarka Sector 10, New Delhi** to demonstrate the honest developing baseline: *"Not enough verified community history yet. Baseline developing."*

**Voiceover / Speaker:**
> *"PAANIPULSE is far more than a basic complaint form. 
> First, our transparent Community Signal Confidence algorithm evaluates reporter diversity, recency decay, and neighbour agreement — giving a verifiable 100-point rating.
> Second, each neighbourhood builds a diurnal Water Fingerprint, mapping typical availability across Morning, Midday, Evening, and Night.
> And third, our explainable Disruption Early-Warning Network detects anomalies. Bandra West usually enjoys 85% morning availability, but multiple independent neighbours have reported dry taps this morning. 
> The system warns the community responsibly, without hallucinating official outages. 
> And for fresh localities like Dwarka with insufficient reports, PAANIPULSE never fakes a baseline — it transparently states that the baseline is developing."*

---

### Segment 5: AWS Cloud Architecture & Deployment (2:15 – 2:40) [25s]
**Visual on Screen:**
Show the clean AWS Architecture Diagram, then briefly show terminal / AWS Console showing the deployed HTTP API Gateway, Lambda function in Python 3.12, and DynamoDB table `PaanipulseReports`.

**Voiceover / Speaker:**
> *"Under the hood, PAANIPULSE runs on a 100% serverless, zero-idle-cost AWS architecture:
> Amazon API Gateway routes incoming traffic with automatic CORS handling.
> AWS Lambda runs our Python 3.12 intelligence engine and statistical models.
> Amazon DynamoDB stores records on-demand using composite partition and sort keys to eliminate expensive table scans.
> And the frontend is deployed via AWS Amplify with CDN edge acceleration.
> Best of all, our architecture operates at 0 dollars per month under the AWS Free Tier."*

---

### Segment 6: Bharat Impact & Conclusion (2:40 – 2:55) [15s]
**Visual on Screen:**
Show the generated **Evidence-Based Locality Report Card** (printable PDF view), then close on the project summary slide with GitHub QR code and Live Demo URL.

**Voiceover / Speaker:**
> *"PAANIPULSE empowers citizens to avoid panic, prevent booster pump burnouts, and hold water boards accountable with evidence-based audit reports. 
> Fully built, thoroughly tested with 100% pass rate, and deployed on AWS. 
> Thank you."*

---
**Total Duration: 2 Minutes 50 Seconds (Under 3:00 limit).**
