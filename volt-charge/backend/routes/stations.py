"""
routes/stations.py — Flask Blueprint for station endpoints.
"""

from flask import Blueprint, request, jsonify
from services import station_service

stations_bp = Blueprint("stations", __name__)


@stations_bp.route("", methods=["GET"])
def get_stations():
    search = request.args.get("search")
    charging_type = request.args.get("chargingType")
    available_only = request.args.get("available", "").lower() in ("true", "1")
    sort_by = request.args.get("sortBy")

    stations = station_service.get_all_stations(
        search=search,
        charging_type=charging_type,
        available_only=available_only,
        sort_by=sort_by
    )
    return jsonify(stations), 200


@stations_bp.route("/<station_id>", methods=["GET"])
def get_station(station_id):
    station = station_service.get_station_by_id(station_id)
    if not station:
        return jsonify({"error": f"Station '{station_id}' not found"}), 404
    return jsonify(station), 200


@stations_bp.route("", methods=["POST"])
def create_station():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON payload"}), 400

    station, error = station_service.create_station(data)
    if error:
        return jsonify({"error": error}), 400
    return jsonify(station), 201


@stations_bp.route("/<station_id>", methods=["PUT"])
def update_station(station_id):
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON payload"}), 400

    station, error = station_service.update_station(station_id, data)
    if error:
        return jsonify({"error": error}), 400
    return jsonify(station), 200


@stations_bp.route("/<station_id>", methods=["DELETE"])
def delete_station(station_id):
    success, error = station_service.delete_station(station_id)
    if error:
        return jsonify({"error": error}), 404
    return jsonify({"success": True, "message": f"Station '{station_id}' deleted"}), 200
