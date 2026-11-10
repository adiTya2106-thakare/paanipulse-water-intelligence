"""
PAANIPULSE - Database Layer
Dual-mode: Uses AWS DynamoDB when running on AWS (or with AWS credentials),
and seamless in-memory / local fallback for local development, tests, and offline demo.
"""
import os
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

logger = logging.getLogger("paanipulse.db")

DYNAMODB_TABLE = os.environ.get("DYNAMODB_TABLE", "PaanipulseReports")
AWS_REGION = os.environ.get("AWS_REGION", "ap-south-1")

# Standard Localities Catalog
INITIAL_LOCALITIES = [
    {
        "id": "mumbai-bandra-west",
        "name": "Bandra West",
        "city": "Mumbai",
        "state": "Maharashtra",
        "lat": 19.0596,
        "lng": 72.8295,
        "ward": "H-West Ward (MCGM)",
        "baseline_status": "ESTABLISHED_BASELINE",
        "has_demo_data": True,
        "historical_windows": {
            "MORNING": {"typical_availability_pct": 85.0, "low_pressure_pct": 10.0, "delayed_pct": 5.0, "no_water_pct": 0.0},
            "MIDDAY": {"typical_availability_pct": 70.0, "low_pressure_pct": 15.0, "delayed_pct": 10.0, "no_water_pct": 5.0},
            "EVENING": {"typical_availability_pct": 80.0, "low_pressure_pct": 10.0, "delayed_pct": 10.0, "no_water_pct": 0.0},
            "NIGHT": {"typical_availability_pct": 50.0, "low_pressure_pct": 20.0, "delayed_pct": 15.0, "no_water_pct": 15.0}
        }
    },
    {
        "id": "mumbai-powai",
        "name": "Powai / Hiranandani",
        "city": "Mumbai",
        "state": "Maharashtra",
        "lat": 19.1176,
        "lng": 72.9060,
        "ward": "S Ward (MCGM)",
        "baseline_status": "ESTABLISHED_BASELINE",
        "has_demo_data": True,
        "historical_windows": {
            "MORNING": {"typical_availability_pct": 92.0, "low_pressure_pct": 5.0, "delayed_pct": 3.0, "no_water_pct": 0.0},
            "MIDDAY": {"typical_availability_pct": 78.0, "low_pressure_pct": 12.0, "delayed_pct": 5.0, "no_water_pct": 5.0},
            "EVENING": {"typical_availability_pct": 88.0, "low_pressure_pct": 8.0, "delayed_pct": 4.0, "no_water_pct": 0.0},
            "NIGHT": {"typical_availability_pct": 65.0, "low_pressure_pct": 15.0, "delayed_pct": 10.0, "no_water_pct": 10.0}
        }
    },
    {
        "id": "pune-kothrud",
        "name": "Kothrud",
        "city": "Pune",
        "state": "Maharashtra",
        "lat": 18.5074,
        "lng": 73.8077,
        "ward": "Kothrud-Bavdhan Ward (PMC)",
        "baseline_status": "DEVELOPING",
        "has_demo_data": True,
        "historical_windows": {
            "MORNING": {"typical_availability_pct": 65.0, "low_pressure_pct": 20.0, "delayed_pct": 15.0, "no_water_pct": 0.0},
            "MIDDAY": {"typical_availability_pct": 45.0, "low_pressure_pct": 25.0, "delayed_pct": 20.0, "no_water_pct": 10.0},
            "EVENING": {"typical_availability_pct": 60.0, "low_pressure_pct": 20.0, "delayed_pct": 15.0, "no_water_pct": 5.0},
            "NIGHT": {"typical_availability_pct": 35.0, "low_pressure_pct": 25.0, "delayed_pct": 25.0, "no_water_pct": 15.0}
        }
    },
    {
        "id": "bengaluru-whitefield",
        "name": "Whitefield",
        "city": "Bengaluru",
        "state": "Karnataka",
        "lat": 12.9698,
        "lng": 77.7499,
        "ward": "Mahadevapura Zone (BWSSB)",
        "baseline_status": "DEVELOPING",
        "has_demo_data": True,
        "historical_windows": {
            "MORNING": {"typical_availability_pct": 55.0, "low_pressure_pct": 25.0, "delayed_pct": 15.0, "no_water_pct": 5.0},
            "MIDDAY": {"typical_availability_pct": 40.0, "low_pressure_pct": 30.0, "delayed_pct": 20.0, "no_water_pct": 10.0},
            "EVENING": {"typical_availability_pct": 50.0, "low_pressure_pct": 25.0, "delayed_pct": 15.0, "no_water_pct": 10.0},
            "NIGHT": {"typical_availability_pct": 30.0, "low_pressure_pct": 30.0, "delayed_pct": 25.0, "no_water_pct": 15.0}
        }
    },
    {
        "id": "delhi-dwarka",
        "name": "Dwarka Sector 10",
        "city": "New Delhi",
        "state": "Delhi",
        "lat": 28.5823,
        "lng": 77.0500,
        "ward": "DJB Zone 2",
        "baseline_status": "NEW_UNVERIFIED",
        "has_demo_data": False,
        "historical_windows": {}
    }
]

def generate_seed_demo_reports() -> List[Dict[str, Any]]:
    """
    Generates clearly marked DEMO reports for initial testing and demonstration.
    Demonstrates:
    - Bandra West: disruption scenario in progress (recent reports of NO_WATER & DELAYED_SUPPLY)
    - Powai: stable high availability scenario
    - Kothrud: intermittent / low pressure scenario
    - Whitefield: developing signal
    - Delhi Dwarka: 0 reports (pristine empty state)
    """
    now = datetime.now(timezone.utc)
    demo_reports = []

    # Bandra West: Demonstrates Active Supply Disruption Warning
    bandra_data = [
        # Recent reports within last 2 hours (triggering early-warning anomaly detection)
        {"hours_ago": 0.5, "obs": "NO_WATER", "pressure": "NONE", "notes": "[DEMO DATA] Morning supply still hasn't arrived in Pali Hill area.", "token": "demo-usr-101"},
        {"hours_ago": 1.1, "obs": "NO_WATER", "pressure": "NONE", "notes": "[DEMO DATA] Taps dry since 7 AM. Neighbours reporting same.", "token": "demo-usr-102"},
        {"hours_ago": 1.8, "obs": "DELAYED_SUPPLY", "pressure": "TRICKLE", "notes": "[DEMO DATA] Only faint air hiss in pipes, normally full pressure by now.", "token": "demo-usr-103"},
        {"hours_ago": 2.5, "obs": "NO_WATER", "pressure": "NONE", "notes": "[DEMO DATA] Building overhead tank not receiving municipal line water.", "token": "demo-usr-104"},
        {"hours_ago": 3.2, "obs": "DELAYED_SUPPLY", "pressure": "TRICKLE", "notes": "[DEMO DATA] Supply delayed by nearly 2 hours.", "token": "demo-usr-105"},
        # Older historical baseline reports
        {"hours_ago": 14.0, "obs": "WATER_AVAILABLE", "pressure": "NORMAL", "notes": "[DEMO DATA] Evening regular supply as usual.", "token": "demo-usr-106"},
        {"hours_ago": 16.0, "obs": "WATER_AVAILABLE", "pressure": "NORMAL", "notes": "[DEMO DATA] Good flow.", "token": "demo-usr-107"},
        {"hours_ago": 24.0, "obs": "WATER_AVAILABLE", "pressure": "NORMAL", "notes": "[DEMO DATA] Normal morning flow.", "token": "demo-usr-108"},
        {"hours_ago": 26.0, "obs": "WATER_AVAILABLE", "pressure": "NORMAL", "notes": "[DEMO DATA] Sufficient for tank filling.", "token": "demo-usr-109"},
        {"hours_ago": 38.0, "obs": "WATER_AVAILABLE", "pressure": "NORMAL", "notes": "[DEMO DATA] Normal baseline.", "token": "demo-usr-110"},
        {"hours_ago": 48.0, "obs": "LOW_PRESSURE", "pressure": "MODERATE", "notes": "[DEMO DATA] Slightly slow flow.", "token": "demo-usr-111"},
        {"hours_ago": 52.0, "obs": "WATER_AVAILABLE", "pressure": "NORMAL", "notes": "[DEMO DATA] Adequate.", "token": "demo-usr-112"},
        {"hours_ago": 60.0, "obs": "WATER_AVAILABLE", "pressure": "NORMAL", "notes": "[DEMO DATA] Normal morning supply.", "token": "demo-usr-113"},
    ]
    for i, r in enumerate(bandra_data):
        t_stamp = (now - timedelta(hours=r["hours_ago"])).isoformat()
        demo_reports.append({
            "report_id": f"demo-rep-bandra-{i+1}",
            "locality_id": "mumbai-bandra-west",
            "locality_name": "Bandra West",
            "observation_type": r["obs"],
            "pressure_level": r["pressure"],
            "notes": r["notes"],
            "timestamp": t_stamp,
            "reporter_token": r["token"],
            "client_ip_hash": "demo-ip-hash",
            "is_demo_data": True,
            "flagged": False
        })

    # Powai: Demonstrates Healthy High-Availability Signal
    powai_data = [
        {"hours_ago": 0.8, "obs": "WATER_AVAILABLE", "pressure": "NORMAL", "notes": "[DEMO DATA] Full pressure supply on Central Ave.", "token": "demo-usr-201"},
        {"hours_ago": 1.4, "obs": "WATER_AVAILABLE", "pressure": "NORMAL", "notes": "[DEMO DATA] Both overhead and ground tanks filled.", "token": "demo-usr-202"},
        {"hours_ago": 2.2, "obs": "WATER_AVAILABLE", "pressure": "NORMAL", "notes": "[DEMO DATA] Running on schedule.", "token": "demo-usr-203"},
        {"hours_ago": 5.0, "obs": "WATER_AVAILABLE", "pressure": "NORMAL", "notes": "[DEMO DATA] Normal supply.", "token": "demo-usr-204"},
        {"hours_ago": 18.0, "obs": "WATER_AVAILABLE", "pressure": "NORMAL", "notes": "[DEMO DATA] Good evening supply.", "token": "demo-usr-205"},
        {"hours_ago": 25.0, "obs": "WATER_AVAILABLE", "pressure": "NORMAL", "notes": "[DEMO DATA] Morning supply normal.", "token": "demo-usr-206"},
        {"hours_ago": 30.0, "obs": "LOW_PRESSURE", "pressure": "MODERATE", "notes": "[DEMO DATA] Slightly lower pressure.", "token": "demo-usr-207"},
        {"hours_ago": 42.0, "obs": "WATER_AVAILABLE", "pressure": "NORMAL", "notes": "[DEMO DATA] Normal baseline.", "token": "demo-usr-208"},
    ]
    for i, r in enumerate(powai_data):
        t_stamp = (now - timedelta(hours=r["hours_ago"])).isoformat()
        demo_reports.append({
            "report_id": f"demo-rep-powai-{i+1}",
            "locality_id": "mumbai-powai",
            "locality_name": "Powai / Hiranandani",
            "observation_type": r["obs"],
            "pressure_level": r["pressure"],
            "notes": r["notes"],
            "timestamp": t_stamp,
            "reporter_token": r["token"],
            "client_ip_hash": "demo-ip-hash",
            "is_demo_data": True,
            "flagged": False
        })

    # Whitefield: Developing signal
    whitefield_data = [
        {"hours_ago": 1.5, "obs": "LOW_PRESSURE", "pressure": "TRICKLE", "notes": "[DEMO DATA] Borewell & BWSSB mix, very weak trickle today.", "token": "demo-usr-301"},
        {"hours_ago": 3.0, "obs": "DELAYED_SUPPLY", "pressure": "MODERATE", "notes": "[DEMO DATA] Supply started 1 hour later than usual timetable.", "token": "demo-usr-302"},
        {"hours_ago": 8.0, "obs": "WATER_AVAILABLE", "pressure": "MODERATE", "notes": "[DEMO DATA] Moderate pressure.", "token": "demo-usr-303"}
    ]
    for i, r in enumerate(whitefield_data):
        t_stamp = (now - timedelta(hours=r["hours_ago"])).isoformat()
        demo_reports.append({
            "report_id": f"demo-rep-wf-{i+1}",
            "locality_id": "bengaluru-whitefield",
            "locality_name": "Whitefield",
            "observation_type": r["obs"],
            "pressure_level": r["pressure"],
            "notes": r["notes"],
            "timestamp": t_stamp,
            "reporter_token": r["token"],
            "client_ip_hash": "demo-ip-hash",
            "is_demo_data": True,
            "flagged": False
        })

    return demo_reports

# In-memory storage for offline / local / test execution
_MEM_REPORTS: List[Dict[str, Any]] = generate_seed_demo_reports()
_MEM_LOCALITIES: List[Dict[str, Any]] = INITIAL_LOCALITIES

class DatabaseManager:
    def __init__(self):
        self.use_dynamodb = False
        self.dynamo_client = None
        self.table = None

        # Check if boto3 and AWS credentials are functional
        try:
            import boto3
            # Check if environment or credentials exist
            if os.environ.get("AWS_ACCESS_KEY_ID") or os.path.exists(os.path.expanduser("~/.aws/credentials")):
                self.dynamo_client = boto3.resource("dynamodb", region_name=AWS_REGION)
                self.table = self.dynamo_client.Table(DYNAMODB_TABLE)
                # Quick check if table is reachable
                _ = self.table.table_status
                self.use_dynamodb = True
                logger.info(f"Connected to AWS DynamoDB Table: {DYNAMODB_TABLE}")
        except Exception as e:
            logger.info(f"Using local in-memory persistence layer (DynamoDB not configured: {e})")
            self.use_dynamodb = False

    def get_localities(self) -> List[Dict[str, Any]]:
        return _MEM_LOCALITIES

    def get_locality_by_id(self, locality_id: str) -> Optional[Dict[str, Any]]:
        for loc in _MEM_LOCALITIES:
            if loc["id"] == locality_id:
                return loc
        return None

    def insert_report(self, report_dict: Dict[str, Any]) -> Dict[str, Any]:
        if self.use_dynamodb and self.table:
            try:
                # DynamoDB item format
                item = {
                    "localityId": report_dict["locality_id"],
                    "timestamp#reportId": f"{report_dict['timestamp']}#{report_dict['report_id']}",
                    **report_dict
                }
                self.table.put_item(Item=item)
                logger.info(f"Inserted report to DynamoDB: {report_dict['report_id']}")
            except Exception as e:
                logger.error(f"DynamoDB put_item failed, saving to local memory: {e}")
                _MEM_REPORTS.append(report_dict)
                return report_dict
        
        # Always mirror in memory for rapid queries
        _MEM_REPORTS.append(report_dict)
        return report_dict

    def query_reports(self, locality_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        # Filter matching locality, not flagged
        matched = [r for r in _MEM_REPORTS if r.get("locality_id") == locality_id and not r.get("flagged", False)]
        # Sort descending by timestamp
        matched.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return matched[:limit]

    def get_all_reports_for_locality(self, locality_id: str) -> List[Dict[str, Any]]:
        matched = [r for r in _MEM_REPORTS if r.get("locality_id") == locality_id and not r.get("flagged", False)]
        matched.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return matched

    def flag_report(self, report_id: str, flagged: bool = True) -> bool:
        for r in _MEM_REPORTS:
            if r.get("report_id") == report_id:
                r["flagged"] = flagged
                return True
        return False

# Global database manager instance
db = DatabaseManager()
