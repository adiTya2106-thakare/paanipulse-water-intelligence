"""
PAANIPULSE - Data Models and Validation Layer
Compliant with AWS Lambda and DynamoDB conventions.
"""
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
import uuid
import re

VALID_OBSERVATION_TYPES = {
    "WATER_AVAILABLE": "Water Available",
    "NO_WATER": "No Water",
    "LOW_PRESSURE": "Low Pressure",
    "DELAYED_SUPPLY": "Delayed Supply",
    "OTHER": "Other Observation"
}

VALID_PRESSURE_LEVELS = {
    "NORMAL": "Normal / Good Pressure",
    "MODERATE": "Moderate / Adequate",
    "TRICKLE": "Trickle / Very Low",
    "NONE": "No Flow"
}

VALID_CONFIDENCE_LEVELS = {
    "LOW": "Low confidence",
    "DEVELOPING": "Developing signal",
    "STRONGER": "Stronger community signal"
}

@dataclass
class WaterReport:
    report_id: str
    locality_id: str
    locality_name: str
    observation_type: str
    pressure_level: Optional[str] = "NORMAL"
    notes: Optional[str] = ""
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    reporter_token: str = "anon-device"
    client_ip_hash: str = "0.0.0.0"
    is_demo_data: bool = False
    flagged: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @staticmethod
    def validate_submission(payload: Dict[str, Any]) -> tuple[bool, str]:
        if not payload:
            return False, "Payload must be a non-empty JSON object."

        locality_id = payload.get("localityId") or payload.get("locality_id")
        if not locality_id or not isinstance(locality_id, str) or len(locality_id.strip()) == 0:
            return False, "localityId is required."

        obs_type = payload.get("observationType") or payload.get("observation_type")
        if not obs_type or obs_type.upper() not in VALID_OBSERVATION_TYPES:
            return False, f"Invalid observationType. Must be one of: {list(VALID_OBSERVATION_TYPES.keys())}"

        pressure = payload.get("pressureLevel") or payload.get("pressure_level")
        if pressure and pressure.upper() not in VALID_PRESSURE_LEVELS:
            return False, f"Invalid pressureLevel. Must be one of: {list(VALID_PRESSURE_LEVELS.keys())}"

        notes = payload.get("notes", "")
        if notes and len(str(notes)) > 280:
            return False, "Notes must be under 280 characters to preserve privacy and brevity."

        # Sanitize notes: strip HTML / script tags
        if notes:
            sanitized_notes = re.sub(r'<[^>]*>', '', str(notes))
            payload["notes"] = sanitized_notes.strip()

        return True, ""

