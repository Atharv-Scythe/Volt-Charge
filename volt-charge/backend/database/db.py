"""
database/db.py — SQLite database initialization, seeding, and helper functions
for the Volt-Charge backend.
"""

import sqlite3
import json
import os
from datetime import datetime, timezone

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "voltcharge.db")

DATA_DIR = os.path.join(os.path.dirname(DB_DIR), "..", "data")
STATIONS_JSON = os.path.join(DATA_DIR, "stations.json")
VEHICLES_JSON = os.path.join(DATA_DIR, "vehicles.json")


def _get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------

_SCHEMA = """
CREATE TABLE IF NOT EXISTS stations (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    location    TEXT NOT NULL,
    latitude    REAL NOT NULL,
    longitude   REAL NOT NULL,
    chargingType TEXT NOT NULL,
    totalPorts  INTEGER NOT NULL,
    availablePorts INTEGER NOT NULL,
    chargingRate REAL NOT NULL,
    waitingTime  INTEGER NOT NULL,
    status      TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS vehicles (
    id                TEXT PRIMARY KEY,
    type              TEXT NOT NULL,
    batteryPercentage INTEGER NOT NULL,
    requiredPercentage INTEGER NOT NULL,
    chargingDuration  INTEGER NOT NULL,
    arrivalTime       TEXT NOT NULL,
    assignedStation   TEXT,
    FOREIGN KEY (assignedStation) REFERENCES stations(id)
);

CREATE TABLE IF NOT EXISTS queue_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicleId   TEXT NOT NULL,
    vehicleType TEXT,
    operation   TEXT NOT NULL,
    stationId   TEXT,
    timestamp   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT NOT NULL,
    details     TEXT NOT NULL,
    timestamp   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS analytics (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    totalVehiclesServed INTEGER NOT NULL DEFAULT 0,
    avgQueueLength      REAL NOT NULL DEFAULT 0,
    avgWaitingTime      REAL NOT NULL DEFAULT 0,
    lastUpdated         TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


# ---------------------------------------------------------------------------
# Initialisation & seeding
# ---------------------------------------------------------------------------

def init_db():
    """Create tables and seed data from JSON files if tables are empty."""
    conn = _get_conn()
    conn.executescript(_SCHEMA)

    # Seed stations
    row = conn.execute("SELECT COUNT(*) AS cnt FROM stations").fetchone()
    if row["cnt"] == 0 and os.path.exists(STATIONS_JSON):
        with open(STATIONS_JSON, "r", encoding="utf-8") as f:
            stations = json.load(f)
        for s in stations:
            conn.execute(
                "INSERT INTO stations (id,name,location,latitude,longitude,"
                "chargingType,totalPorts,availablePorts,chargingRate,waitingTime,status) "
                "VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                (s["id"], s["name"], s["location"], s["latitude"], s["longitude"],
                 s["chargingType"], s["totalPorts"], s["availablePorts"],
                 s["chargingRate"], s["waitingTime"], s.get("status", "active")),
            )
        conn.commit()

    # Seed vehicles
    row = conn.execute("SELECT COUNT(*) AS cnt FROM vehicles").fetchone()
    if row["cnt"] == 0 and os.path.exists(VEHICLES_JSON):
        with open(VEHICLES_JSON, "r", encoding="utf-8") as f:
            vehicles = json.load(f)
        for v in vehicles:
            conn.execute(
                "INSERT INTO vehicles (id,type,batteryPercentage,requiredPercentage,"
                "chargingDuration,arrivalTime,assignedStation) "
                "VALUES (?,?,?,?,?,?,?)",
                (v["id"], v["type"], v["batteryPercentage"], v["requiredPercentage"],
                 v["chargingDuration"], v["arrivalTime"], v.get("assignedStation")),
            )
        conn.commit()

    # Seed initial analytics row if missing
    row = conn.execute("SELECT COUNT(*) AS cnt FROM analytics").fetchone()
    if row["cnt"] == 0:
        conn.execute(
            "INSERT INTO analytics (totalVehiclesServed,avgQueueLength,avgWaitingTime) "
            "VALUES (0,0,0)"
        )
        conn.commit()

    conn.close()


# ---------------------------------------------------------------------------
# Station helpers
# ---------------------------------------------------------------------------

def _row_to_dict(row):
    return dict(row) if row else None


def get_all_stations():
    conn = _get_conn()
    rows = conn.execute("SELECT * FROM stations ORDER BY id").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_station(station_id):
    conn = _get_conn()
    row = conn.execute("SELECT * FROM stations WHERE id=?", (station_id,)).fetchone()
    conn.close()
    return _row_to_dict(row)


def add_station(data):
    conn = _get_conn()
    conn.execute(
        "INSERT INTO stations (id,name,location,latitude,longitude,"
        "chargingType,totalPorts,availablePorts,chargingRate,waitingTime,status) "
        "VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (data["id"], data["name"], data["location"], data["latitude"],
         data["longitude"], data["chargingType"], data["totalPorts"],
         data["availablePorts"], data["chargingRate"], data["waitingTime"],
         data.get("status", "active")),
    )
    conn.commit()
    station = get_station(data["id"])
    conn.close()
    return station


def update_station(station_id, data):
    conn = _get_conn()
    existing = conn.execute("SELECT * FROM stations WHERE id=?", (station_id,)).fetchone()
    if not existing:
        conn.close()
        return None

    fields = []
    values = []
    allowed = ["name", "location", "latitude", "longitude", "chargingType",
               "totalPorts", "availablePorts", "chargingRate", "waitingTime", "status"]
    for key in allowed:
        if key in data:
            fields.append(f"{key}=?")
            values.append(data[key])
    if fields:
        values.append(station_id)
        conn.execute(f"UPDATE stations SET {','.join(fields)} WHERE id=?", values)
        conn.commit()

    row = conn.execute("SELECT * FROM stations WHERE id=?", (station_id,)).fetchone()
    conn.close()
    return _row_to_dict(row)


def delete_station(station_id):
    conn = _get_conn()
    existing = conn.execute("SELECT * FROM stations WHERE id=?", (station_id,)).fetchone()
    if not existing:
        conn.close()
        return False
    conn.execute("DELETE FROM stations WHERE id=?", (station_id,))
    conn.commit()
    conn.close()
    return True


# ---------------------------------------------------------------------------
# Activity log
# ---------------------------------------------------------------------------

def get_all_vehicles():
    conn = _get_conn()
    try:
        rows = conn.execute("SELECT * FROM vehicles ORDER BY arrivalTime ASC").fetchall()
        return [_row_to_dict(r) for r in rows]
    finally:
        conn.close()


def add_vehicle(data):
    conn = _get_conn()
    try:
        conn.execute(
            """INSERT INTO vehicles (id, type, batteryPercentage, requiredPercentage, chargingDuration, arrivalTime, assignedStation)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                data["id"],
                data.get("type", "Standard EV"),
                data.get("batteryPercentage", 20),
                data.get("requiredPercentage", 80),
                data.get("chargingDuration", 30),
                data.get("arrivalTime", datetime.now(timezone.utc).isoformat()),
                data.get("assignedStation", "ST001"),
            ),
        )
        conn.commit()
    finally:
        conn.close()
    return data


def delete_vehicle(vehicle_id):
    conn = _get_conn()
    try:
        conn.execute("DELETE FROM vehicles WHERE id = ?", (vehicle_id,))
        conn.commit()
    finally:
        conn.close()


def clear_all_vehicles():
    conn = _get_conn()
    try:
        conn.execute("DELETE FROM vehicles")
        conn.commit()
    finally:
        conn.close()


def log_activity(activity_type, details):
    conn = _get_conn()
    conn.execute(
        "INSERT INTO activity_log (type, details, timestamp) VALUES (?,?,?)",
        (activity_type, details, datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# Queue history
# ---------------------------------------------------------------------------

def add_queue_history(vehicle_id, vehicle_type, operation, station_id=None):
    conn = _get_conn()
    conn.execute(
        "INSERT INTO queue_history (vehicleId, vehicleType, operation, stationId, timestamp) "
        "VALUES (?,?,?,?,?)",
        (vehicle_id, vehicle_type, operation, station_id,
         datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------

def get_analytics():
    conn = _get_conn()

    total_stations = conn.execute("SELECT COUNT(*) AS cnt FROM stations").fetchone()["cnt"]

    analytics_row = conn.execute("SELECT * FROM analytics ORDER BY id DESC LIMIT 1").fetchone()
    total_vehicles_served = analytics_row["totalVehiclesServed"] if analytics_row else 0
    avg_queue_length = analytics_row["avgQueueLength"] if analytics_row else 0
    avg_waiting_time = analytics_row["avgWaitingTime"] if analytics_row else 0

    # Station utilization
    stations = conn.execute("SELECT id, name, totalPorts, availablePorts FROM stations").fetchall()
    station_utilization = []
    for s in stations:
        total = s["totalPorts"]
        used = total - s["availablePorts"]
        utilization = round((used / total) * 100, 1) if total > 0 else 0
        station_utilization.append({
            "stationId": s["id"],
            "stationName": s["name"],
            "utilization": utilization,
            "usedPorts": used,
            "totalPorts": total,
        })

    # Charging completions (last 7 activity log entries of type 'charging_complete')
    completions = conn.execute(
        "SELECT * FROM activity_log WHERE type='charging_complete' "
        "ORDER BY timestamp DESC LIMIT 7"
    ).fetchall()
    charging_completions = [dict(c) for c in completions]

    # Recent activity (last 10)
    recent = conn.execute(
        "SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 10"
    ).fetchall()
    recent_activity = [dict(r) for r in recent]

    conn.close()

    return {
        "totalStations": total_stations,
        "totalVehiclesServed": total_vehicles_served,
        "avgQueueLength": avg_queue_length,
        "avgWaitingTime": avg_waiting_time,
        "stationUtilization": station_utilization,
        "chargingCompletions": charging_completions,
        "recentActivity": recent_activity,
    }


def update_analytics(**kwargs):
    conn = _get_conn()
    fields = []
    values = []
    for key in ("totalVehiclesServed", "avgQueueLength", "avgWaitingTime"):
        if key in kwargs:
            fields.append(f"{key}=?")
            values.append(kwargs[key])
    if fields:
        fields.append("lastUpdated=?")
        values.append(datetime.now(timezone.utc).isoformat())
        conn.execute(
            f"UPDATE analytics SET {','.join(fields)} WHERE id="
            "(SELECT id FROM analytics ORDER BY id DESC LIMIT 1)",
            values,
        )
        conn.commit()
    conn.close()
