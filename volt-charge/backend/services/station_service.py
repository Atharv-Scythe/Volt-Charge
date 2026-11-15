"""
services/station_service.py — Service layer for station management.
"""

from database import db


def get_all_stations(search=None, charging_type=None, available_only=False, sort_by=None):
    stations = db.get_all_stations()

    # Search filter
    if search:
        s = search.lower().strip()
        stations = [
            st for st in stations
            if s in st["name"].lower() or s in st["id"].lower() or s in st["location"].lower()
        ]

    # Charging type filter
    if charging_type and charging_type.lower() != "all":
        stations = [
            st for st in stations
            if st["chargingType"].lower() == charging_type.lower()
        ]

    # Availability filter
    if available_only:
        stations = [st for st in stations if st["availablePorts"] > 0]

    # Sort
    if sort_by:
        if sort_by == "name":
            stations.sort(key=lambda x: x["name"])
        elif sort_by == "waitingTime":
            stations.sort(key=lambda x: x["waitingTime"])
        elif sort_by == "availablePorts":
            stations.sort(key=lambda x: x["availablePorts"], reverse=True)
        elif sort_by == "chargingRate":
            stations.sort(key=lambda x: x["chargingRate"], reverse=True)

    return stations


def get_station_by_id(station_id):
    return db.get_station(station_id)


def create_station(data):
    # Validation
    required_fields = [
        "id", "name", "location", "latitude", "longitude",
        "chargingType", "totalPorts", "availablePorts",
        "chargingRate", "waitingTime"
    ]
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == "":
            return None, f"Missing required field: {field}"

    existing = db.get_station(data["id"])
    if existing:
        return None, f"Station with ID '{data['id']}' already exists"

    try:
        data["latitude"] = float(data["latitude"])
        data["longitude"] = float(data["longitude"])
        data["totalPorts"] = int(data["totalPorts"])
        data["availablePorts"] = int(data["availablePorts"])
        data["chargingRate"] = float(data["chargingRate"])
        data["waitingTime"] = int(data["waitingTime"])
        data["status"] = data.get("status", "active")
    except (ValueError, TypeError) as e:
        return None, f"Invalid data types: {str(e)}"

    if data["availablePorts"] > data["totalPorts"]:
        return None, "Available ports cannot exceed total ports"

    created = db.add_station(data)
    db.log_activity("station_added", f"Added station {data['name']} ({data['id']})")
    return created, None


def update_station(station_id, data):
    existing = db.get_station(station_id)
    if not existing:
        return None, f"Station with ID '{station_id}' not found"

    # Type casting
    if "latitude" in data:
        data["latitude"] = float(data["latitude"])
    if "longitude" in data:
        data["longitude"] = float(data["longitude"])
    if "totalPorts" in data:
        data["totalPorts"] = int(data["totalPorts"])
    if "availablePorts" in data:
        data["availablePorts"] = int(data["availablePorts"])
    if "chargingRate" in data:
        data["chargingRate"] = float(data["chargingRate"])
    if "waitingTime" in data:
        data["waitingTime"] = int(data["waitingTime"])

    updated = db.update_station(station_id, data)
    db.log_activity("station_updated", f"Updated station {existing['name']} ({station_id})")
    return updated, None


def delete_station(station_id):
    existing = db.get_station(station_id)
    if not existing:
        return False, f"Station with ID '{station_id}' not found"

    db.delete_station(station_id)
    db.log_activity("station_deleted", f"Deleted station {existing['name']} ({station_id})")
    return True, None
