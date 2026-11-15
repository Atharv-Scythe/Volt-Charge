"""
services/queue_service.py — Service layer for Circular Queue operations.
"""

from database import db
from services.algorithm_service import run_algorithm

# In-memory queue state backed by DB
_queue = []
MAX_CAPACITY = 20


def _init_queue():
    global _queue
    if not _queue:
        vehicles = db.get_all_vehicles()
        _queue = vehicles[:MAX_CAPACITY]


_init_queue()


def get_queue_status():
    _init_queue()
    res = run_algorithm("queue_status", {
        "initialVehicles": _queue
    })
    return {
        "vehicles": _queue,
        "size": len(_queue),
        "capacity": MAX_CAPACITY,
        "front": 0 if _queue else -1,
        "rear": (len(_queue) - 1) if _queue else -1,
        "currentlyCharging": _queue[0] if _queue else None,
        "nextInLine": _queue[1] if len(_queue) > 1 else None,
        "engineResult": res
    }


def enqueue_vehicle(vehicle_data):
    global _queue
    _init_queue()

    # Edge cases
    if len(_queue) >= MAX_CAPACITY:
        return None, f"Queue overflow: Maximum capacity ({MAX_CAPACITY}) reached"

    vid = vehicle_data.get("id")
    if not vid:
        return None, "Vehicle ID is required"

    for v in _queue:
        if v["id"] == vid:
            return None, f"Vehicle ID '{vid}' already exists in queue"

    # Normalize fields
    v = {
        "id": vid,
        "type": vehicle_data.get("type", "Standard EV"),
        "batteryPercentage": int(vehicle_data.get("batteryPercentage", 20)),
        "requiredPercentage": int(vehicle_data.get("requiredPercentage", 80)),
        "chargingDuration": int(vehicle_data.get("chargingDuration", 30)),
        "arrivalTime": vehicle_data.get("arrivalTime", ""),
        "assignedStation": vehicle_data.get("assignedStation", "ST001")
    }

    # Run via C++ engine
    res = run_algorithm("enqueue", {
        "initialVehicles": _queue,
        "vehicle": v
    })

    _queue.append(v)
    db.add_vehicle(v)
    db.log_activity("vehicle_enqueued", f"Vehicle {v['id']} ({v['type']}) joined queue")

    return {
        "success": True,
        "vehicle": v,
        "queueState": _queue,
        "size": len(_queue),
        "capacity": MAX_CAPACITY,
        "front": 0,
        "rear": len(_queue) - 1,
        "engineResult": res
    }, None


def dequeue_vehicle():
    global _queue
    _init_queue()

    if not _queue:
        return None, "Queue underflow: Queue is currently empty"

    departing = _queue.pop(0)

    # Run via C++ engine
    res = run_algorithm("dequeue", {
        "initialVehicles": [departing] + _queue
    })

    db.delete_vehicle(departing["id"])
    db.log_activity("vehicle_dequeued", f"Vehicle {departing['id']} finished charging and departed")

    return {
        "success": True,
        "departedVehicle": departing,
        "queueState": _queue,
        "size": len(_queue),
        "capacity": MAX_CAPACITY,
        "front": 0 if _queue else -1,
        "rear": (len(_queue) - 1) if _queue else -1,
        "currentlyCharging": _queue[0] if _queue else None,
        "engineResult": res
    }, None


def peek_queue():
    _init_queue()
    if not _queue:
        return None, "Queue is empty"

    res = run_algorithm("peek", {
        "initialVehicles": _queue
    })

    return {
        "frontVehicle": _queue[0],
        "size": len(_queue),
        "engineResult": res
    }, None


def clear_queue():
    global _queue
    _queue = []
    db.clear_all_vehicles()
    db.log_activity("queue_cleared", "Queue cleared by operator")
    return {
        "success": True,
        "message": "Queue cleared successfully",
        "size": 0
    }
