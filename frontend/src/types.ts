export type ObservationType = 
  | 'WATER_AVAILABLE' 
  | 'NO_WATER' 
  | 'LOW_PRESSURE' 
  | 'DELAYED_SUPPLY' 
  | 'OTHER';

export type PressureLevel = 
  | 'NORMAL' 
  | 'MODERATE' 
  | 'TRICKLE' 
  | 'NONE';

export type ConfidenceLevel = 'LOW' | 'DEVELOPING' | 'STRONGER';

export interface Locality {
  id: string;
  name: string;
  city: string;
  state: string;
  ward?: string;
  lat: number;
  lng: number;
  baseline_status: 'ESTABLISHED_BASELINE' | 'DEVELOPING' | 'NEW_UNVERIFIED';
  has_demo_data?: boolean;
  total_reports?: number;
  reported_availability_share?: number;
  community_confidence?: ConfidenceLevel;
  community_confidence_label?: string;
  current_status?: 'REPORTED_AVAILABLE' | 'POSSIBLE_DISRUPTION' | 'INSUFFICIENT_DATA' | 'IMPROVING_OR_INTERMITTENT' | 'LOW_PRESSURE_REPORTED';
  has_active_alert?: boolean;
}

export interface WaterReport {
  report_id: string;
  locality_id: string;
  locality_name: string;
  observation_type: ObservationType;
  pressure_level?: PressureLevel;
  notes?: string;
  timestamp: string;
  reporter_token: string;
  is_demo_data?: boolean;
  flagged?: boolean;
}

export interface ConfidenceData {
  score: number;
  level: ConfidenceLevel;
  label: string;
  active_report_count: number;
  distinct_reporters: number;
  agreement_ratio: number;
  fresh_reports_last_2h: number;
  reasons: string[];
}

export interface DisruptionAlert {
  alert_id: string;
  locality_id: string;
  locality_name: string;
  severity: 'WARNING' | 'CRITICAL';
  title: string;
  what_changed: string;
  when_observed: string;
  report_count: number;
  disruption_report_count: number;
  distinct_reporters: number;
  confidence_level: ConfidenceLevel;
  explanation: string;
  guidance: string[];
  created_at: string;
}

export interface FingerprintWindow {
  window_name: string;
  sample_count: number;
  availability_share: number;
  low_pressure_pct: number;
  delay_pct: number;
  no_water_pct: number;
  typical_status: string;
}

export interface FingerprintData {
  locality_id: string;
  status: 'ESTABLISHED_BASELINE' | 'DEVELOPING';
  message: string;
  total_reports: number;
  threshold_required?: number;
  window_profiles: Record<string, FingerprintWindow>;
  common_delay_periods: string[];
  low_pressure_frequency_pct: number;
  overall_availability_share: number;
}

export interface LocalitySummary {
  locality: Locality;
  total_reports: number;
  reported_availability_share: number;
  low_pressure_share: number;
  delayed_share: number;
  current_status: string;
  status_label: string;
  status_description: string;
  confidence: ConfidenceData;
  alert: DisruptionAlert | null;
  has_demo_data: boolean;
  disclaimer: string;
}

export interface ReportCardData {
  report_title: string;
  locality_name: string;
  city: string;
  ward?: string;
  generated_at: string;
  reporting_window: string;
  total_observations_recorded: number;
  metrics: {
    reported_availability_share: string;
    reported_no_water_share: string;
    low_pressure_frequency: string;
    supply_delay_frequency: string;
  };
  community_confidence: {
    level: ConfidenceLevel;
    label: string;
    score: string;
    explanation: string[];
  };
  fingerprint_status: string;
  common_delay_periods: string[];
  active_disruption_warning: DisruptionAlert | null;
  legal_and_methodological_disclaimer: string;
}

