"""
routes/algorithms.py — Flask Blueprint for algorithm endpoints.
"""

from flask import Blueprint, request, jsonify
from services.algorithm_service import run_algorithm
from database import db
from services import queue_service

algorithms_bp = Blueprint("algorithms", __name__)


@algorithms_bp.route("/nearest", methods=["POST"])
def nearest_station():
    data = request.get_json(silent=True) or {}
    user_lat = float(data.get("userLat", data.get("latitude", 28.6139)))
    user_lon = float(data.get("userLon", data.get("longitude", 77.2090)))
    stations = data.get("stations")

    if not stations:
        stations = db.get_all_stations()

    result = run_algorithm("nearest_station", {
        "userLat": user_lat,
        "userLon": user_lon,
        "stations": stations
    })
    return jsonify(result), 200


@algorithms_bp.route("/search", methods=["POST"])
def search_stations():
    data = request.get_json(silent=True) or {}
    algorithm = data.get("algorithm", "linear_search")
    key = data.get("key", "").strip()
    field = data.get("field", "id")
    stations = data.get("stations")

    if not stations:
        stations = db.get_all_stations()

    # For binary search, sort by search field first so binary search is valid
    if algorithm == "binary_search":
        stations = sorted(stations, key=lambda s: str(s.get(field, "")))

    result = run_algorithm(algorithm, {
        "key": key,
        "field": field,
        "stations": stations
    })
    return jsonify(result), 200


@algorithms_bp.route("/sort", methods=["POST"])
def sort_stations():
    data = request.get_json(silent=True) or {}
    algorithm = data.get("algorithm", "bubble_sort")
    criteria = data.get("criteria", "distance")
    stations = data.get("stations")
    dataset_size = data.get("datasetSize")

    if not stations:
        stations = db.get_all_stations()

    # If datasetSize requested is larger than current stations, generate simulated items
    if dataset_size and isinstance(dataset_size, int) and dataset_size > len(stations):
        import random
        base = list(stations)
        needed = dataset_size - len(base)
        for i in range(needed):
            idx = len(base) + 1
            base.append({
                "id": f"ST{idx:04d}",
                "name": f"Station {idx}",
                "location": f"Zone {idx % 20}",
                "latitude": 28.5 + (random.random() * 0.4),
                "longitude": 77.1 + (random.random() * 0.4),
                "distance": round(random.random() * 40.0 + 1.0, 2),
                "availablePorts": random.randint(0, 15),
                "totalPorts": random.randint(4, 20),
                "waitingTime": random.randint(0, 60),
                "chargingRate": random.choice([22, 50, 150, 200, 250]),
                "status": "active"
            })
        stations = base

    result = run_algorithm(algorithm, {
        "criteria": criteria,
        "stations": stations
    })
    return jsonify(result), 200


@algorithms_bp.route("/queue", methods=["POST"])
def queue_operations():
    data = request.get_json(silent=True) or {}
    operation = data.get("operation", "status")

    if operation == "status":
        return jsonify(queue_service.get_queue_status()), 200

    elif operation == "enqueue":
        vehicle_data = data.get("vehicle")
        if not vehicle_data:
            return jsonify({"error": "Missing vehicle data for enqueue"}), 400
        res, err = queue_service.enqueue_vehicle(vehicle_data)
        if err:
            return jsonify({"error": err}), 400
        return jsonify(res), 200

    elif operation == "dequeue":
        res, err = queue_service.dequeue_vehicle()
        if err:
            return jsonify({"error": err}), 400
        return jsonify(res), 200

    elif operation == "peek":
        res, err = queue_service.peek_queue()
        if err:
            return jsonify({"error": err}), 400
        return jsonify(res), 200

    elif operation == "clear":
        res = queue_service.clear_queue()
        return jsonify(res), 200

    else:
        return jsonify({"error": f"Unknown queue operation: {operation}"}), 400
