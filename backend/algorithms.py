"""
PAANIPULSE - Core Intelligence Algorithms
1. Community Signal Confidence
2. Explainable Disruption Early-Warning Anomaly Detection
3. Locality Water Fingerprint Engine
"""
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

def parse_iso_datetime(dt_str: str) -> datetime:
    try:
        # Handle trailing Z or offsets
        clean_str = dt_str.replace("Z", "+00:00")
        return datetime.fromisoformat(clean_str)
    except Exception:
        return datetime.now(timezone.utc)

def get_time_window(dt: datetime) -> str:
    # India Standard Time (UTC+5:30)
    ist_offset = timedelta(hours=5, minutes=30)
    ist_dt = dt.astimezone(timezone(ist_offset))
    hour = ist_dt.hour
    if 6 <= hour < 10:
        return "MORNING"    # 06:00 - 10:00
    elif 10 <= hour < 16:
        return "MIDDAY"     # 10:00 - 16:00
    elif 16 <= hour < 21:
        return "EVENING"    # 16:00 - 21:00
    else:
        return "NIGHT"      # 21:00 - 06:00

TIME_WINDOW_LABELS = {
    "MORNING": "Morning (6:00 AM - 10:00 AM)",
    "MIDDAY": "Midday (10:00 AM - 4:00 PM)",
    "EVENING": "Evening (4:00 PM - 9:00 PM)",
    "NIGHT": "Night (9:00 PM - 6:00 AM)"
}

def calculate_confidence(reports: List[Dict[str, Any]], now: Optional[datetime] = None) -> Dict[str, Any]:
    """
    Transparent scoring method based on:
    1. Independent reporter count (distinct devices)
    2. Recency of reports (higher weight to recent hours)
    3. Agreement ratio among observations
    4. Time distribution
    """
    if now is None:
        now = datetime.now(timezone.utc)

    # Consider reports within last 24 hours for active confidence
    active_reports = []
    for r in reports:
        dt = parse_iso_datetime(r.get("timestamp", ""))
        age_hours = (now - dt).total_seconds() / 3600.0
        if 0 <= age_hours <= 24:
            active_reports.append((r, age_hours))

    if not active_reports:
        return {
            "score": 0.0,
            "level": "LOW",
            "label": "Low confidence",
            "active_report_count": 0,
            "distinct_reporters": 0,
            "reasons": [
                "No reports received in the last 24 hours.",
                "Community baseline awaiting new observations."
            ]
        }

    distinct_reporters = len(set(r[0].get("reporter_token", "anon") for r in active_reports))
    total_active = len(active_reports)

    # 1. Volume Score (max 30 pts)
    # 1 reporter: 8 pts, 2 reporters: 16 pts, 3: 22 pts, 4: 26 pts, 5+: 30 pts
    volume_score = min(30.0, distinct_reporters * 7.5)

    # 2. Recency Score (max 35 pts)
    # Reports < 2 hrs: weight 1.0; 2-6 hrs: 0.7; 6-12 hrs: 0.4; 12-24 hrs: 0.15
    recency_sum = 0.0
    fresh_count = 0
    for r, age in active_reports:
        if age <= 2:
            recency_sum += 1.0
            fresh_count += 1
        elif age <= 6:
            recency_sum += 0.7
        elif age <= 12:
            recency_sum += 0.4
        else:
            recency_sum += 0.15
    normalized_recency = min(35.0, (recency_sum / max(1, total_active)) * 35.0)

    # 3. Agreement Score (max 35 pts)
    # Check agreement among problem vs normal status
    problem_count = sum(1 for r, _ in active_reports if r.get("observation_type") in ["NO_WATER", "LOW_PRESSURE", "DELAYED_SUPPLY"])
    available_count = sum(1 for r, _ in active_reports if r.get("observation_type") == "WATER_AVAILABLE")
    
    majority_count = max(problem_count, available_count)
    agreement_ratio = majority_count / total_active if total_active > 0 else 0.5
    agreement_score = agreement_ratio * 35.0

    total_score = round(volume_score + normalized_recency + agreement_score, 1)

    # Determine confidence level and human-readable explanation
    reasons = []
    if distinct_reporters >= 4 and total_score >= 65 and fresh_count >= 2:
        level = "STRONGER"
        label = "Stronger community signal"
        reasons.append(f"Confirmed by {distinct_reporters} independent community reporters.")
        reasons.append(f"{fresh_count} report(s) submitted within the last 2 hours.")
        reasons.append(f"{int(agreement_ratio * 100)}% agreement across neighbourhood observations.")
    elif (distinct_reporters >= 2 and total_score >= 40) or (fresh_count >= 1 and total_score >= 35):
        level = "DEVELOPING"
        label = "Developing signal"
        reasons.append(f"Supported by {distinct_reporters} independent report(s) in the locality.")
        reasons.append("Signal is emerging but requires additional neighbour confirmations.")
        reasons.append(f"Recent consensus is currently at {int(agreement_ratio * 100)}%.")
    else:
        level = "LOW"
        label = "Low confidence"
        reasons.append(f"Limited data: only {distinct_reporters} reporter(s) recorded recently.")
        reasons.append("Single or older reports cannot establish locality-wide conditions.")
        reasons.append("More neighbourhood reports needed to increase signal certainty.")

    return {
        "score": total_score,
        "level": level,
        "label": label,
        "active_report_count": total_active,
        "distinct_reporters": distinct_reporters,
        "agreement_ratio": round(agreement_ratio, 2),
        "fresh_reports_last_2h": fresh_count,
        "reasons": reasons
    }

def calculate_fingerprint(locality_id: str, all_reports: List[Dict[str, Any]], baseline_config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Computes locality-specific historical water availability profile across time windows.
    If historical count is below threshold (< 12 reports), cleanly indicates developing status.
    """
    total_reports = len(all_reports)
    MIN_THRESHOLD = 12

    if total_reports < MIN_THRESHOLD and not baseline_config:
        return {
            "locality_id": locality_id,
            "status": "DEVELOPING",
            "message": "Not enough verified community history yet. This locality's Water Fingerprint is developing.",
            "total_reports": total_reports,
            "threshold_required": MIN_THRESHOLD,
            "window_profiles": {},
            "common_delay_periods": [],
            "low_pressure_frequency_pct": 0.0,
            "overall_availability_share": 0.0
        }

    # If baseline_config provided (e.g. established locality baseline), use it and merge real reports
    window_stats = {
        "MORNING": {"total": 0, "available": 0, "low_pressure": 0, "delayed": 0, "no_water": 0},
        "MIDDAY": {"total": 0, "available": 0, "low_pressure": 0, "delayed": 0, "no_water": 0},
        "EVENING": {"total": 0, "available": 0, "low_pressure": 0, "delayed": 0, "no_water": 0},
        "NIGHT": {"total": 0, "available": 0, "low_pressure": 0, "delayed": 0, "no_water": 0}
    }

    # Aggregate from actual reports
    for r in all_reports:
        dt = parse_iso_datetime(r.get("timestamp", ""))
        w = get_time_window(dt)
        obs = r.get("observation_type", "OTHER")
        window_stats[w]["total"] += 1
        if obs == "WATER_AVAILABLE":
            window_stats[w]["available"] += 1
        elif obs == "LOW_PRESSURE":
            window_stats[w]["low_pressure"] += 1
        elif obs == "DELAYED_SUPPLY":
            window_stats[w]["delayed"] += 1
        elif obs == "NO_WATER":
            window_stats[w]["no_water"] += 1

    # Merge with verified baseline config if exists
    if baseline_config and "historical_windows" in baseline_config:
        for w, b_vals in baseline_config["historical_windows"].items():
            if w in window_stats:
                weight = baseline_config.get("baseline_weight", 15)
                window_stats[w]["total"] += weight
                window_stats[w]["available"] += int(weight * (b_vals.get("typical_availability_pct", 75) / 100.0))
                window_stats[w]["low_pressure"] += int(weight * (b_vals.get("low_pressure_pct", 10) / 100.0))
                window_stats[w]["delayed"] += int(weight * (b_vals.get("delayed_pct", 10) / 100.0))
                window_stats[w]["no_water"] += int(weight * (b_vals.get("no_water_pct", 5) / 100.0))

    profiles = {}
    total_all = 0
    total_available = 0
    total_low_pressure = 0
    common_delay_windows = []

    for w_key, counts in window_stats.items():
        w_tot = counts["total"]
        total_all += w_tot
        total_available += counts["available"]
        total_low_pressure += counts["low_pressure"]

        avail_pct = round((counts["available"] / w_tot * 100.0), 1) if w_tot > 0 else 0.0
        low_pct = round((counts["low_pressure"] / w_tot * 100.0), 1) if w_tot > 0 else 0.0
        delay_pct = round((counts["delayed"] / w_tot * 100.0), 1) if w_tot > 0 else 0.0
        no_water_pct = round((counts["no_water"] / w_tot * 100.0), 1) if w_tot > 0 else 0.0

        if delay_pct >= 25.0:
            common_delay_windows.append(TIME_WINDOW_LABELS[w_key])

        profiles[w_key] = {
            "window_name": TIME_WINDOW_LABELS[w_key],
            "sample_count": w_tot,
            "availability_share": avail_pct,
            "low_pressure_pct": low_pct,
            "delay_pct": delay_pct,
            "no_water_pct": no_water_pct,
            "typical_status": "High Availability" if avail_pct >= 70 else ("Intermittent" if avail_pct >= 40 else "Infrequent Supply")
        }

    overall_avail = round((total_available / total_all * 100.0), 1) if total_all > 0 else 0.0
    overall_low_p = round((total_low_pressure / total_all * 100.0), 1) if total_all > 0 else 0.0

    return {
        "locality_id": locality_id,
        "status": "ESTABLISHED_BASELINE",
        "message": "Established neighbourhood baseline calculated from verified community reports.",
        "total_reports": total_reports,
        "window_profiles": profiles,
        "common_delay_periods": common_delay_windows if common_delay_windows else ["None typically observed"],
        "low_pressure_frequency_pct": overall_low_p,
        "overall_availability_share": overall_avail
    }

def detect_disruptions(
    locality_id: str,
    locality_name: str,
    recent_reports: List[Dict[str, Any]],
    fingerprint: Dict[str, Any],
    now: Optional[datetime] = None
) -> Optional[Dict[str, Any]]:
    """
    Explainable anomaly-detection mechanism:
    Compares recent observations (last 4 hours) against locality's historical baseline for current time window.
    Never uses words like 'official outage confirmed'.
    """
    if now is None:
        now = datetime.now(timezone.utc)

    # If baseline is developing, we cannot claim disruption
    if fingerprint.get("status") != "ESTABLISHED_BASELINE":
        return None

    current_window = get_time_window(now)
    window_profile = fingerprint.get("window_profiles", {}).get(current_window)
    if not window_profile:
        return None

    historical_avail = window_profile.get("availability_share", 0.0)
    # Only detect disruption if this window usually has good supply (>= 60%)
    if historical_avail < 55.0:
        return None

    # Filter reports from last 4 hours
    window_reports = []
    for r in recent_reports:
        dt = parse_iso_datetime(r.get("timestamp", ""))
        age_hrs = (now - dt).total_seconds() / 3600.0
        if 0 <= age_hrs <= 4.0:
            window_reports.append(r)

    if len(window_reports) < 2:
        return None

    distinct_reporters = len(set(r.get("reporter_token", "anon") for r in window_reports))
    if distinct_reporters < 2:
        return None

    no_water_count = sum(1 for r in window_reports if r.get("observation_type") == "NO_WATER")
    delayed_count = sum(1 for r in window_reports if r.get("observation_type") == "DELAYED_SUPPLY")
    disruption_count = no_water_count + delayed_count
    total_recent = len(window_reports)

    disruption_rate = disruption_count / total_recent

    # Trigger threshold: >= 50% disruption reports among recent submissions
    if disruption_rate >= 0.50:
        # Determine confidence level
        conf_level = "STRONGER" if distinct_reporters >= 3 and disruption_count >= 3 else "DEVELOPING"
        
        explanation = (
            f"During the {TIME_WINDOW_LABELS[current_window]}, {locality_name} typically records "
            f"{historical_avail}% reported availability. In the last 4 hours, {disruption_count} out of "
            f"{total_recent} community reports ({int(disruption_rate * 100)}%) indicate no water or delayed supply."
        )

        guidance = [
            "Check current updates from immediate neighbours to verify local building valve status.",
            "Conserve existing stored water and delay high-volume usage (e.g. washing machines).",
            "Contact your local municipal ward office or water tanker supply helpline if delay exceeds normal windows.",
            "Contribute an observation update to keep your neighbourhood informed as conditions evolve."
        ]

        return {
            "alert_id": f"alert-{locality_id}-{current_window.lower()}",
            "locality_id": locality_id,
            "locality_name": locality_name,
            "severity": "WARNING",
            "title": "Community reports indicate a possible supply disruption",
            "what_changed": f"Reported availability dropped significantly below the {historical_avail}% typical baseline.",
            "when_observed": f"Observed over the last 4 hours ({TIME_WINDOW_LABELS[current_window]})",
            "report_count": total_recent,
            "disruption_report_count": disruption_count,
            "distinct_reporters": distinct_reporters,
            "confidence_level": conf_level,
            "explanation": explanation,
            "guidance": guidance,
            "created_at": now.isoformat()
        }

    return None
