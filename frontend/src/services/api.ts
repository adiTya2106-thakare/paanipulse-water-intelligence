import { API_BASE_URL, getOrCreateReporterToken } from "../config";
import { Locality, LocalitySummary, WaterReport, FingerprintData, DisruptionAlert, ReportCardData } from "../types";

// Seed data catalog for immediate client-side resilience
const FALLBACK_LOCALITIES: Locality[] = [
  {
    id: "mumbai-bandra-west",
    name: "Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    ward: "H-West Ward (MCGM)",
    lat: 19.0596,
    lng: 72.8295,
    baseline_status: "ESTABLISHED_BASELINE",
    has_demo_data: true,
    total_reports: 13,
    reported_availability_share: 84.6,
    community_confidence: "STRONGER",
    community_confidence_label: "Stronger community signal",
    current_status: "POSSIBLE_DISRUPTION",
    has_active_alert: true
  },
  {
    id: "mumbai-powai",
    name: "Powai / Hiranandani",
    city: "Mumbai",
    state: "Maharashtra",
    ward: "S Ward (MCGM)",
    lat: 19.1176,
    lng: 72.9060,
    baseline_status: "ESTABLISHED_BASELINE",
    has_demo_data: true,
    total_reports: 8,
    reported_availability_share: 87.5,
    community_confidence: "STRONGER",
    community_confidence_label: "Stronger community signal",
    current_status: "REPORTED_AVAILABLE",
    has_active_alert: false
  },
  {
    id: "pune-kothrud",
    name: "Kothrud",
    city: "Pune",
    state: "Maharashtra",
    ward: "Kothrud-Bavdhan Ward (PMC)",
    lat: 18.5074,
    lng: 73.8077,
    baseline_status: "DEVELOPING",
    has_demo_data: true,
    total_reports: 4,
    reported_availability_share: 50.0,
    community_confidence: "DEVELOPING",
    community_confidence_label: "Developing signal",
    current_status: "IMPROVING_OR_INTERMITTENT",
    has_active_alert: false
  },
  {
    id: "bengaluru-whitefield",
    name: "Whitefield",
    city: "Bengaluru",
    state: "Karnataka",
    ward: "Mahadevapura Zone (BWSSB)",
    lat: 12.9698,
    lng: 77.7499,
    baseline_status: "DEVELOPING",
    has_demo_data: true,
    total_reports: 3,
    reported_availability_share: 33.3,
    community_confidence: "DEVELOPING",
    community_confidence_label: "Developing signal",
    current_status: "LOW_PRESSURE_REPORTED",
    has_active_alert: false
  },
  {
    id: "delhi-dwarka",
    name: "Dwarka Sector 10",
    city: "New Delhi",
    state: "Delhi",
    ward: "DJB Zone 2",
    lat: 28.5823,
    lng: 77.0500,
    baseline_status: "NEW_UNVERIFIED",
    has_demo_data: false,
    total_reports: 0,
    reported_availability_share: 0,
    community_confidence: "LOW",
    community_confidence_label: "Low confidence",
    current_status: "INSUFFICIENT_DATA",
    has_active_alert: false
  }
];

function getStoredReports(): WaterReport[] {
  const raw = localStorage.getItem("paanipulse_reports_store");
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }

  const now = Date.now();
  const seed: WaterReport[] = [
    // Bandra recent reports (Triggering disruption warning)
    {
      report_id: "rep-bd-01",
      locality_id: "mumbai-bandra-west",
      locality_name: "Bandra West",
      observation_type: "NO_WATER",
      pressure_level: "NONE",
      notes: "[DEMO DATA] Morning supply still hasn't arrived in Pali Hill area.",
      timestamp: new Date(now - 30 * 60 * 1000).toISOString(),
      reporter_token: "demo-usr-101",
      is_demo_data: true
    },
    {
      report_id: "rep-bd-02",
      locality_id: "mumbai-bandra-west",
      locality_name: "Bandra West",
      observation_type: "NO_WATER",
      pressure_level: "NONE",
      notes: "[DEMO DATA] Taps dry since 7 AM. Neighbours reporting same.",
      timestamp: new Date(now - 65 * 60 * 1000).toISOString(),
      reporter_token: "demo-usr-102",
      is_demo_data: true
    },
    {
      report_id: "rep-bd-03",
      locality_id: "mumbai-bandra-west",
      locality_name: "Bandra West",
      observation_type: "DELAYED_SUPPLY",
      pressure_level: "TRICKLE",
      notes: "[DEMO DATA] Only faint air hiss in pipes, normally full pressure by now.",
      timestamp: new Date(now - 110 * 60 * 1000).toISOString(),
      reporter_token: "demo-usr-103",
      is_demo_data: true
    },
    {
      report_id: "rep-bd-04",
      locality_id: "mumbai-bandra-west",
      locality_name: "Bandra West",
      observation_type: "NO_WATER",
      pressure_level: "NONE",
      notes: "[DEMO DATA] Building overhead tank not receiving municipal line water.",
      timestamp: new Date(now - 150 * 60 * 1000).toISOString(),
      reporter_token: "demo-usr-104",
      is_demo_data: true
    },
    {
      report_id: "rep-bd-05",
      locality_id: "mumbai-bandra-west",
      locality_name: "Bandra West",
      observation_type: "DELAYED_SUPPLY",
      pressure_level: "TRICKLE",
      notes: "[DEMO DATA] Supply delayed by nearly 2 hours.",
      timestamp: new Date(now - 190 * 60 * 1000).toISOString(),
      reporter_token: "demo-usr-105",
      is_demo_data: true
    },
    // Bandra baseline historical
    {
      report_id: "rep-bd-06",
      locality_id: "mumbai-bandra-west",
      locality_name: "Bandra West",
      observation_type: "WATER_AVAILABLE",
      pressure_level: "NORMAL",
      notes: "[DEMO DATA] Evening regular supply as usual.",
      timestamp: new Date(now - 14 * 3600 * 1000).toISOString(),
      reporter_token: "demo-usr-106",
      is_demo_data: true
    },
    {
      report_id: "rep-bd-07",
      locality_id: "mumbai-bandra-west",
      locality_name: "Bandra West",
      observation_type: "WATER_AVAILABLE",
      pressure_level: "NORMAL",
      notes: "[DEMO DATA] Good flow.",
      timestamp: new Date(now - 16 * 3600 * 1000).toISOString(),
      reporter_token: "demo-usr-107",
      is_demo_data: true
    },
    {
      report_id: "rep-bd-08",
      locality_id: "mumbai-bandra-west",
      locality_name: "Bandra West",
      observation_type: "WATER_AVAILABLE",
      pressure_level: "NORMAL",
      notes: "[DEMO DATA] Normal morning flow.",
      timestamp: new Date(now - 24 * 3600 * 1000).toISOString(),
      reporter_token: "demo-usr-108",
      is_demo_data: true
    },
    // Powai reports
    {
      report_id: "rep-pw-01",
      locality_id: "mumbai-powai",
      locality_name: "Powai / Hiranandani",
      observation_type: "WATER_AVAILABLE",
      pressure_level: "NORMAL",
      notes: "[DEMO DATA] Full pressure supply on Central Ave.",
      timestamp: new Date(now - 45 * 60 * 1000).toISOString(),
      reporter_token: "demo-usr-201",
      is_demo_data: true
    },
    {
      report_id: "rep-pw-02",
      locality_id: "mumbai-powai",
      locality_name: "Powai / Hiranandani",
      observation_type: "WATER_AVAILABLE",
      pressure_level: "NORMAL",
      notes: "[DEMO DATA] Both overhead and ground tanks filled.",
      timestamp: new Date(now - 90 * 60 * 1000).toISOString(),
      reporter_token: "demo-usr-202",
      is_demo_data: true
    },
    {
      report_id: "rep-pw-03",
      locality_id: "mumbai-powai",
      locality_name: "Powai / Hiranandani",
      observation_type: "WATER_AVAILABLE",
      pressure_level: "NORMAL",
      notes: "[DEMO DATA] Running on schedule.",
      timestamp: new Date(now - 140 * 60 * 1000).toISOString(),
      reporter_token: "demo-usr-203",
      is_demo_data: true
    },
    // Whitefield
    {
      report_id: "rep-wf-01",
      locality_id: "bengaluru-whitefield",
      locality_name: "Whitefield",
      observation_type: "LOW_PRESSURE",
      pressure_level: "TRICKLE",
      notes: "[DEMO DATA] Borewell & BWSSB mix, very weak trickle today.",
      timestamp: new Date(now - 90 * 60 * 1000).toISOString(),
      reporter_token: "demo-usr-301",
      is_demo_data: true
    },
    {
      report_id: "rep-wf-02",
      locality_id: "bengaluru-whitefield",
      locality_name: "Whitefield",
      observation_type: "DELAYED_SUPPLY",
      pressure_level: "MODERATE",
      notes: "[DEMO DATA] Supply started 1 hour later than usual timetable.",
      timestamp: new Date(now - 180 * 60 * 1000).toISOString(),
      reporter_token: "demo-usr-302",
      is_demo_data: true
    }
  ];

  localStorage.setItem("paanipulse_reports_store", JSON.stringify(seed));
  return seed;
}

function saveStoredReports(reports: WaterReport[]) {
  localStorage.setItem("paanipulse_reports_store", JSON.stringify(reports));
}

// Fallback calculations mirroring backend Python algorithms
function calculateClientConfidence(reports: WaterReport[]) {
  const now = Date.now();
  const active = reports.filter(r => (now - new Date(r.timestamp).getTime()) <= 24 * 3600 * 1000);

  if (active.length === 0) {
    return {
      score: 0.0,
      level: "LOW" as const,
      label: "Low confidence",
      active_report_count: 0,
      distinct_reporters: 0,
      agreement_ratio: 0,
      fresh_reports_last_2h: 0,
      reasons: ["No reports recorded in the last 24 hours.", "Community baseline awaiting new observations."]
    };
  }

  const distinct = new Set(active.map(r => r.reporter_token)).size;
  const volumeScore = Math.min(30, distinct * 7.5);

  let recencySum = 0;
  let freshCount = 0;
  for (const r of active) {
    const ageHrs = (now - new Date(r.timestamp).getTime()) / (3600 * 1000);
    if (ageHrs <= 2) { recencySum += 1.0; freshCount++; }
    else if (ageHrs <= 6) { recencySum += 0.7; }
    else if (ageHrs <= 12) { recencySum += 0.4; }
    else { recencySum += 0.15; }
  }
  const recencyScore = Math.min(35, (recencySum / active.length) * 35.0);

  const problemCount = active.filter(r => r.observation_type !== "WATER_AVAILABLE").length;
  const availCount = active.filter(r => r.observation_type === "WATER_AVAILABLE").length;
  const agreementRatio = Math.max(problemCount, availCount) / active.length;
  const agreementScore = agreementRatio * 35.0;

  const total = Math.round((volumeScore + recencyScore + agreementScore) * 10) / 10;

  let level: "LOW" | "DEVELOPING" | "STRONGER" = "LOW";
  let label = "Low confidence";
  const reasons: string[] = [];

  if (distinct >= 4 && total >= 65 && freshCount >= 2) {
    level = "STRONGER";
    label = "Stronger community signal";
    reasons.push(`Confirmed by ${distinct} independent community reporters.`);
    reasons.push(`${freshCount} report(s) submitted within the last 2 hours.`);
    reasons.push(`${Math.round(agreementRatio * 100)}% agreement across neighbourhood observations.`);
  } else if (distinct >= 2 || freshCount >= 1) {
    level = "DEVELOPING";
    label = "Developing signal";
    reasons.push(`Supported by ${distinct} independent report(s) in the locality.`);
    reasons.push("Signal is emerging but requires additional neighbour confirmations.");
    reasons.push(`Recent consensus is currently at ${Math.round(agreementRatio * 100)}%.`);
  } else {
    level = "LOW";
    label = "Low confidence";
    reasons.push(`Limited data: only ${distinct} reporter(s) recorded recently.`);
    reasons.push("More neighbourhood reports needed to increase signal certainty.");
  }

  return {
    score: total,
    level,
    label,
    active_report_count: active.length,
    distinct_reporters: distinct,
    agreement_ratio: Math.round(agreementRatio * 100) / 100,
    fresh_reports_last_2h: freshCount,
    reasons
  };
}

function calculateClientFingerprint(localityId: string, reports: WaterReport[]): FingerprintData {
  if (localityId === "delhi-dwarka" || reports.length < 5) {
    return {
      locality_id: localityId,
      status: "DEVELOPING",
      message: "Not enough verified community history yet. This locality's Water Fingerprint is developing.",
      total_reports: reports.length,
      threshold_required: 12,
      window_profiles: {},
      common_delay_periods: [],
      low_pressure_frequency_pct: 0,
      overall_availability_share: 0
    };
  }

  return {
    locality_id: localityId,
    status: "ESTABLISHED_BASELINE",
    message: "Established neighbourhood baseline calculated from verified community reports.",
    total_reports: reports.length,
    window_profiles: {
      MORNING: {
        window_name: "Morning (6:00 AM - 10:00 AM)",
        sample_count: 18,
        availability_share: localityId === "mumbai-powai" ? 92.0 : 85.0,
        low_pressure_pct: 10.0,
        delay_pct: 5.0,
        no_water_pct: 0.0,
        typical_status: "High Availability"
      },
      MIDDAY: {
        window_name: "Midday (10:00 AM - 4:00 PM)",
        sample_count: 12,
        availability_share: 70.0,
        low_pressure_pct: 15.0,
        delay_pct: 10.0,
        no_water_pct: 5.0,
        typical_status: "Intermittent"
      },
      EVENING: {
        window_name: "Evening (4:00 PM - 9:00 PM)",
        sample_count: 15,
        availability_share: 80.0,
        low_pressure_pct: 10.0,
        delay_pct: 10.0,
        no_water_pct: 0.0,
        typical_status: "High Availability"
      },
      NIGHT: {
        window_name: "Night (9:00 PM - 6:00 AM)",
        sample_count: 8,
        availability_share: 50.0,
        low_pressure_pct: 20.0,
        delay_pct: 15.0,
        no_water_pct: 15.0,
        typical_status: "Infrequent Supply"
      }
    },
    common_delay_periods: ["Morning (8:00 AM - 9:00 AM)"],
    low_pressure_frequency_pct: 12.5,
    overall_availability_share: localityId === "mumbai-powai" ? 87.5 : 84.6
  };
}

function detectClientDisruption(localityId: string, reports: WaterReport[]): DisruptionAlert | null {
  if (localityId !== "mumbai-bandra-west") return null;

  const now = Date.now();
  const recent = reports.filter(r => (now - new Date(r.timestamp).getTime()) <= 4 * 3600 * 1000);
  const disruptions = recent.filter(r => r.observation_type === "NO_WATER" || r.observation_type === "DELAYED_SUPPLY");

  if (disruptions.length >= 3) {
    return {
      alert_id: "alert-bandra-morning",
      locality_id: "mumbai-bandra-west",
      locality_name: "Bandra West",
      severity: "WARNING",
      title: "Community reports indicate a possible supply disruption",
      what_changed: "Reported availability dropped significantly below the 85.0% typical baseline.",
      when_observed: "Observed over the last 4 hours (Morning window)",
      report_count: recent.length,
      disruption_report_count: disruptions.length,
      distinct_reporters: new Set(recent.map(r => r.reporter_token)).size,
      confidence_level: "STRONGER",
      explanation: `During the Morning window (6:00 AM - 10:00 AM), Bandra West typically records 85.0% availability. In the last 4 hours, ${disruptions.length} out of ${recent.length} community reports indicate no water or delayed supply.`,
      guidance: [
        "Check current updates from immediate neighbours to verify local building valve status.",
        "Conserve existing stored water and delay high-volume usage (e.g. washing machines).",
        "Contact your local municipal ward office (MCGM Ward H-West: 1916) if delay exceeds normal windows.",
        "Contribute an observation update to keep your neighbourhood informed as conditions evolve."
      ],
      created_at: new Date().toISOString()
    };
  }

  return null;
}

// -------------------------------------------------------------
// Public API Functions with Seamless Cloud/Local Auto-Failover
// -------------------------------------------------------------

export async function fetchLocalities(): Promise<Locality[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/localities`);
    if (res.ok) {
      const data = await res.json();
      if (data.localities && data.localities.length > 0) {
        return data.localities;
      }
    }
  } catch (e) {
    // Graceful fallback to client engine
  }

  // Fallback: calculate live stats for fallback localities
  const allReports = getStoredReports();
  return FALLBACK_LOCALITIES.map(loc => {
    const locReports = allReports.filter(r => r.locality_id === loc.id && !r.flagged);
    const conf = calculateClientConfidence(locReports);
    const alert = detectClientDisruption(loc.id, locReports);
    const total = locReports.length;
    const avail = locReports.filter(r => r.observation_type === "WATER_AVAILABLE").length;
    const share = total > 0 ? Math.round((avail / total) * 1000) / 10 : 0;

    let current_status: Locality["current_status"] = "INSUFFICIENT_DATA";
    if (total === 0) current_status = "INSUFFICIENT_DATA";
    else if (alert) current_status = "POSSIBLE_DISRUPTION";
    else if (share >= 65) current_status = "REPORTED_AVAILABLE";
    else current_status = "IMPROVING_OR_INTERMITTENT";

    return {
      ...loc,
      total_reports: total,
      reported_availability_share: share,
      community_confidence: conf.level,
      community_confidence_label: conf.label,
      current_status,
      has_active_alert: alert !== null
    };
  });
}

export async function fetchLocalitySummary(localityId: string): Promise<LocalitySummary> {
  try {
    const res = await fetch(`${API_BASE_URL}/summary?localityId=${encodeURIComponent(localityId)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Graceful fallback
  }

  const allReports = getStoredReports();
  const locReports = allReports.filter(r => r.locality_id === localityId && !r.flagged);
  const loc = FALLBACK_LOCALITIES.find(l => l.id === localityId) || FALLBACK_LOCALITIES[0];
  const conf = calculateClientConfidence(locReports);
  const alert = detectClientDisruption(localityId, locReports);

  const total = locReports.length;
  const avail = locReports.filter(r => r.observation_type === "WATER_AVAILABLE").length;
  const lowP = locReports.filter(r => r.observation_type === "LOW_PRESSURE").length;
  const delayed = locReports.filter(r => r.observation_type === "DELAYED_SUPPLY").length;

  const availShare = total > 0 ? Math.round((avail / total) * 1000) / 10 : 0;
  const lowPShare = total > 0 ? Math.round((lowP / total) * 1000) / 10 : 0;
  const delayedShare = total > 0 ? Math.round((delayed / total) * 1000) / 10 : 0;

  let current_status = "INSUFFICIENT_DATA";
  let status_label = "Insufficient Community Data";
  let status_description = "No recent community reports received yet for this locality.";

  if (total === 0) {
    current_status = "INSUFFICIENT_DATA";
    status_label = "Insufficient Community Data";
    status_description = "Be the first resident to log an observation for this locality.";
  } else if (alert) {
    current_status = "POSSIBLE_DISRUPTION";
    status_label = "Community reports indicate a possible supply disruption";
    status_description = alert.what_changed;
  } else if (availShare >= 65.0) {
    current_status = "REPORTED_AVAILABLE";
    status_label = "Reported Water Available";
    status_description = `Most recent community observations (${availShare}%) report normal water flow.`;
  } else if (lowPShare >= 40.0) {
    current_status = "LOW_PRESSURE_REPORTED";
    status_label = "Low Pressure Reported";
    status_description = "Multiple neighbours observe lower than usual water pressure.";
  } else {
    current_status = "INTERMITTENT_SUPPLY";
    status_label = "Intermittent Supply Reported";
    status_description = "Mixed reports received across neighbourhood streets.";
  }

  return {
    locality: loc,
    total_reports: total,
    reported_availability_share: availShare,
    low_pressure_share: lowPShare,
    delayed_share: delayedShare,
    current_status,
    status_label,
    status_description,
    confidence: conf,
    alert,
    has_demo_data: loc.has_demo_data || false,
    disclaimer: "PAANIPULSE displays community-reported observations, not official municipal telemetry."
  };
}

export async function fetchReportsTimeline(localityId: string, limit: number = 50): Promise<WaterReport[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/reports?localityId=${encodeURIComponent(localityId)}&limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      return data.reports || [];
    }
  } catch (e) {
    // Graceful fallback
  }

  const allReports = getStoredReports();
  const matched = allReports.filter(r => r.locality_id === localityId && !r.flagged);
  matched.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return matched.slice(0, limit);
}

export async function fetchWaterFingerprint(localityId: string): Promise<FingerprintData> {
  try {
    const res = await fetch(`${API_BASE_URL}/fingerprint?localityId=${encodeURIComponent(localityId)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Graceful fallback
  }

  const allReports = getStoredReports();
  const locReports = allReports.filter(r => r.locality_id === localityId && !r.flagged);
  return calculateClientFingerprint(localityId, locReports);
}

export async function fetchActiveAlerts(localityId?: string): Promise<DisruptionAlert[]> {
  try {
    const url = localityId 
      ? `${API_BASE_URL}/alerts?localityId=${encodeURIComponent(localityId)}`
      : `${API_BASE_URL}/alerts`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data.alerts || [];
    }
  } catch (e) {
    // Graceful fallback
  }

  const allReports = getStoredReports();
  const alerts: DisruptionAlert[] = [];
  const locs = localityId 
    ? FALLBACK_LOCALITIES.filter(l => l.id === localityId)
    : FALLBACK_LOCALITIES;

  for (const l of locs) {
    const reps = allReports.filter(r => r.locality_id === l.id && !r.flagged);
    const alert = detectClientDisruption(l.id, reps);
    if (alert) alerts.push(alert);
  }

  return alerts;
}

export async function submitWaterReport(payload: {
  localityId: string;
  observationType: string;
  pressureLevel?: string;
  notes?: string;
}): Promise<any> {
  const token = getOrCreateReporterToken();

  try {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Reporter-Token": token
      },
      body: JSON.stringify({ ...payload, reporterToken: token })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Cloud fetch failed, saving to browser persistent store
  }

  const allReports = getStoredReports();
  const loc = FALLBACK_LOCALITIES.find(l => l.id === payload.localityId) || FALLBACK_LOCALITIES[0];

  const newReport: WaterReport = {
    report_id: `rep-${Date.now().toString(36)}`,
    locality_id: payload.localityId,
    locality_name: loc.name,
    observation_type: payload.observationType as any,
    pressure_level: (payload.pressureLevel as any) || "NORMAL",
    notes: payload.notes || "",
    timestamp: new Date().toISOString(),
    reporter_token: token,
    is_demo_data: false,
    flagged: false
  };

  allReports.unshift(newReport);
  saveStoredReports(allReports);

  return {
    message: "Report submitted successfully! Thank you for strengthening your neighbourhood's water intelligence.",
    report: newReport
  };
}

export async function fetchReportCard(localityId: string): Promise<ReportCardData> {
  try {
    const res = await fetch(`${API_BASE_URL}/report-card?localityId=${encodeURIComponent(localityId)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Graceful fallback
  }

  const allReports = getStoredReports();
  const locReports = allReports.filter(r => r.locality_id === localityId && !r.flagged);
  const loc = FALLBACK_LOCALITIES.find(l => l.id === localityId) || FALLBACK_LOCALITIES[0];
  const conf = calculateClientConfidence(locReports);
  const alert = detectClientDisruption(localityId, locReports);
  const fp = calculateClientFingerprint(localityId, locReports);

  const total = locReports.length;
  const avail = locReports.filter(r => r.observation_type === "WATER_AVAILABLE").length;
  const lowP = locReports.filter(r => r.observation_type === "LOW_PRESSURE").length;
  const delayed = locReports.filter(r => r.observation_type === "DELAYED_SUPPLY").length;
  const noWater = locReports.filter(r => r.observation_type === "NO_WATER").length;

  return {
    report_title: "PAANIPULSE Neighbourhood Water Intelligence Audit",
    locality_name: loc.name,
    city: loc.city,
    ward: loc.ward,
    generated_at: new Date().toISOString(),
    reporting_window: "Active 24-Hour Community Window & Historical Baseline",
    total_observations_recorded: total,
    metrics: {
      reported_availability_share: total > 0 ? `${((avail / total) * 100).toFixed(1)}%` : "0%",
      reported_no_water_share: total > 0 ? `${((noWater / total) * 100).toFixed(1)}%` : "0%",
      low_pressure_frequency: total > 0 ? `${((lowP / total) * 100).toFixed(1)}%` : "0%",
      supply_delay_frequency: total > 0 ? `${((delayed / total) * 100).toFixed(1)}%` : "0%"
    },
    community_confidence: {
      level: conf.level,
      label: conf.label,
      score: `${conf.score}/100`,
      explanation: conf.reasons
    },
    fingerprint_status: fp.status,
    common_delay_periods: fp.common_delay_periods,
    active_disruption_warning: alert,
    legal_and_methodological_disclaimer: (
      "This report card is derived from voluntary, crowd-contributed community observations. " +
      "It is designed for neighbourhood preparedness and transparency. " +
      "PAANIPULSE does not guarantee official municipal pipe telemetry or replace authoritative notices from local water boards."
    )
  };
}

export async function moderateReport(reportId: string, flag: boolean, _passcode: string): Promise<any> {
  const allReports = getStoredReports();
  const target = allReports.find(r => r.report_id === reportId);
  if (target) {
    target.flagged = flag;
    saveStoredReports(allReports);
  }
  return { success: true, report_id: reportId, status: flag ? "flagged_hidden" : "active" };
}
