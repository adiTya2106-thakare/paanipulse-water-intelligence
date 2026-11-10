import { API_BASE_URL, getOrCreateReporterToken } from "../config";
import { Locality, LocalitySummary, WaterReport, FingerprintData, DisruptionAlert, ReportCardData } from "../types";

export async function fetchLocalities(): Promise<Locality[]> {
  const res = await fetch(`${API_BASE_URL}/localities`);
  if (!res.ok) {
    throw new Error(`Failed to load localities catalog: ${res.statusText}`);
  }
  const data = await res.json();
  return data.localities || [];
}

export async function fetchLocalitySummary(localityId: string): Promise<LocalitySummary> {
  const res = await fetch(`${API_BASE_URL}/summary?localityId=${encodeURIComponent(localityId)}`);
  if (!res.ok) {
    throw new Error(`Failed to load locality summary: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchReportsTimeline(localityId: string, limit: number = 50): Promise<WaterReport[]> {
  const res = await fetch(`${API_BASE_URL}/reports?localityId=${encodeURIComponent(localityId)}&limit=${limit}`);
  if (!res.ok) {
    throw new Error(`Failed to load reports timeline: ${res.statusText}`);
  }
  const data = await res.json();
  return data.reports || [];
}

export async function fetchWaterFingerprint(localityId: string): Promise<FingerprintData> {
  const res = await fetch(`${API_BASE_URL}/fingerprint?localityId=${encodeURIComponent(localityId)}`);
  if (!res.ok) {
    throw new Error(`Failed to load water fingerprint: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchActiveAlerts(localityId?: string): Promise<DisruptionAlert[]> {
  const url = localityId 
    ? `${API_BASE_URL}/alerts?localityId=${encodeURIComponent(localityId)}`
    : `${API_BASE_URL}/alerts`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load alerts: ${res.statusText}`);
  }
  const data = await res.json();
  return data.alerts || [];
}

export async function submitWaterReport(payload: {
  localityId: string;
  observationType: string;
  pressureLevel?: string;
  notes?: string;
}): Promise<any> {
  const token = getOrCreateReporterToken();
  const res = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Reporter-Token": token
    },
    body: JSON.stringify({
      ...payload,
      reporterToken: token
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to submit water report.");
  }
  return data;
}

export async function fetchReportCard(localityId: string): Promise<ReportCardData> {
  const res = await fetch(`${API_BASE_URL}/report-card?localityId=${encodeURIComponent(localityId)}`);
  if (!res.ok) {
    throw new Error(`Failed to generate evidence report: ${res.statusText}`);
  }
  return await res.json();
}

export async function moderateReport(reportId: string, flag: boolean, passcode: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/admin/moderate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      adminPasscode: passcode,
      reportId: reportId,
      flag: flag
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Moderation action failed.");
  }
  return data;
}

