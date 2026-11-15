"""
services/algorithm_service.py — Runs the C++ volt_engine binary or falls back
to pure-Python implementations of all algorithms.
"""

import json
import math
import os
import subprocess
import time
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Locate the C++ binary
# ---------------------------------------------------------------------------

_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_BINARY_CANDIDATES = [
    os.path.join(_PROJECT_ROOT, "algorithms", "volt_engine.exe"),
    os.path.join(_PROJECT_ROOT, "algorithms", "build", "volt_engine.exe"),
    os.path.join(_PROJECT_ROOT, "algorithms", "volt_engine"),
    os.path.join(_PROJECT_ROOT, "algorithms", "build", "volt_engine"),
]

ENGINE_PATH = None
for _p in _BINARY_CANDIDATES:
    if os.path.isfile(_p):
        ENGINE_PATH = _p
        break


def engine_available():
    return ENGINE_PATH is not None


# ---------------------------------------------------------------------------
# Run via C++ binary
# ---------------------------------------------------------------------------

def run_algorithm(operation, data):
    """Run *operation* through the C++ engine or fall back to Python."""
    if ENGINE_PATH is not None:
        try:
            payload = json.dumps({"operation": operation, "data": data})
            result = subprocess.run(
                [ENGINE_PATH],
                input=payload,
                capture_output=True,
                text=True,
                timeout=10,
            )
            if result.returncode == 0 and result.stdout.strip():
                return json.loads(result.stdout)
            # Non-zero exit or empty stdout → fallback
        except (subprocess.TimeoutExpired, json.JSONDecodeError, OSError):
            pass  # fall through to Python fallback

    # ---- Python fallback ----
    return _fallback(operation, data)


# ===================================================================
# FALLBACK — pure-Python implementations
# ===================================================================

def _fallback(operation, data):
    dispatch = {
        # Queue
        "enqueue": _fb_enqueue,
        "dequeue": _fb_dequeue,
        "peek": _fb_peek,
        "queue_status": _fb_queue_status,
        "clear_queue": _fb_clear_queue,
        # Search
        "linear_search": _fb_linear_search,
        "binary_search": _fb_binary_search,
        # Sort
        "bubble_sort": _fb_bubble_sort,
        "selection_sort": _fb_selection_sort,
        "merge_sort": _fb_merge_sort,
        "quick_sort": _fb_quick_sort,
        # Nearest
        "nearest_station": _fb_nearest_station,
        "calculate_distances": _fb_calculate_distances,
        "stations_in_range": _fb_stations_in_range,
    }
    fn = dispatch.get(operation)
    if fn is None:
        return {"error": f"Unknown operation: {operation}"}
    try:
        return fn(data)
    except Exception as exc:
        return {"error": str(exc)}


# ---------------------------------------------------------------------------
# Circular queue (in-memory, capacity 20)
# ---------------------------------------------------------------------------

_QUEUE_MAX = 20
_queue: list = []  # simple list used as ring buffer stand-in


def _fb_enqueue(data):
    vehicle = data.get("vehicle", data)
    steps = []
    if len(_queue) >= _QUEUE_MAX:
        steps.append({
            "operation": "enqueue",
            "vehicleId": vehicle.get("id"),
            "front": 0,
            "rear": len(_queue) - 1,
            "size": len(_queue),
            "queueState": [v["id"] for v in _queue],
            "message": "Queue is full — cannot enqueue",
        })
        return {"success": False, "message": "Queue is full", "steps": steps}

    _queue.append(vehicle)
    steps.append({
        "operation": "enqueue",
        "vehicleId": vehicle.get("id"),
        "front": 0,
        "rear": len(_queue) - 1,
        "size": len(_queue),
        "queueState": [v["id"] for v in _queue],
        "message": f"Vehicle {vehicle.get('id')} enqueued successfully",
    })
    return {"success": True, "vehicle": vehicle, "queueSize": len(_queue), "steps": steps}


def _fb_dequeue(data):
    steps = []
    if not _queue:
        steps.append({
            "operation": "dequeue",
            "vehicleId": None,
            "front": 0,
            "rear": 0,
            "size": 0,
            "queueState": [],
            "message": "Queue is empty — nothing to dequeue",
        })
        return {"success": False, "message": "Queue is empty", "steps": steps}

    vehicle = _queue.pop(0)
    steps.append({
        "operation": "dequeue",
        "vehicleId": vehicle["id"],
        "front": 0,
        "rear": max(len(_queue) - 1, 0),
        "size": len(_queue),
        "queueState": [v["id"] for v in _queue],
        "message": f"Vehicle {vehicle['id']} dequeued successfully",
    })
    return {"success": True, "vehicle": vehicle, "queueSize": len(_queue), "steps": steps}


def _fb_peek(data):
    if not _queue:
        return {"success": False, "message": "Queue is empty", "vehicle": None}
    return {"success": True, "vehicle": _queue[0], "queueSize": len(_queue)}


def _fb_queue_status(data):
    return {
        "success": True,
        "size": len(_queue),
        "capacity": _QUEUE_MAX,
        "isEmpty": len(_queue) == 0,
        "isFull": len(_queue) >= _QUEUE_MAX,
        "queue": list(_queue),
    }


def _fb_clear_queue(data):
    _queue.clear()
    return {"success": True, "message": "Queue cleared", "queueSize": 0, "steps": [
        {"operation": "clear_queue", "vehicleId": None, "front": 0, "rear": 0,
         "size": 0, "queueState": [], "message": "Queue cleared"}
    ]}


# ---------------------------------------------------------------------------
# Searching
# ---------------------------------------------------------------------------

def _fb_linear_search(data):
    stations = data.get("stations", [])
    key = data.get("key", "")
    field = data.get("field", "id")
    steps = []

    for idx, s in enumerate(stations):
        value = str(s.get(field, ""))
        match = value.lower() == str(key).lower()
        steps.append({
            "index": idx,
            "stationId": s.get("id"),
            "compared": value,
            "match": match,
        })
        if match:
            return {"found": True, "station": s, "index": idx, "steps": steps}

    return {"found": False, "station": None, "index": -1, "steps": steps}


def _fb_binary_search(data):
    stations = data.get("stations", [])
    key = data.get("key", "")
    field = data.get("field", "id")

    # Ensure sorted
    stations = sorted(stations, key=lambda s: str(s.get(field, "")).lower())

    steps = []
    low, high = 0, len(stations) - 1
    while low <= high:
        mid = (low + high) // 2
        mid_value = str(stations[mid].get(field, ""))
        cmp_key = str(key).lower()
        cmp_mid = mid_value.lower()
        match = cmp_mid == cmp_key
        steps.append({
            "low": low,
            "high": high,
            "mid": mid,
            "midValue": mid_value,
            "compared": cmp_key,
            "match": match,
        })
        if match:
            return {"found": True, "station": stations[mid], "index": mid, "steps": steps}
        elif cmp_mid < cmp_key:
            low = mid + 1
        else:
            high = mid - 1

    return {"found": False, "station": None, "index": -1, "steps": steps}


# ---------------------------------------------------------------------------
# Sorting
# ---------------------------------------------------------------------------

def _sort_key(station, criteria):
    mapping = {
        "distance": "waitingTime",  # proxy when no user location
        "availablePorts": "availablePorts",
        "waitingTime": "waitingTime",
        "name": "name",
    }
    field = mapping.get(criteria, criteria)
    val = station.get(field, 0)
    if isinstance(val, str):
        return val.lower()
    return val


def _fb_bubble_sort(data):
    arr = list(data.get("stations", []))
    criteria = data.get("criteria", "name")
    steps = []
    comparisons = swaps = 0
    t0 = time.perf_counter()

    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            comparisons += 1
            step_entry = {"step": comparisons, "action": "compare",
                          "indices": [j, j + 1],
                          "values": [_sort_key(arr[j], criteria),
                                     _sort_key(arr[j + 1], criteria)]}
            if _sort_key(arr[j], criteria) > _sort_key(arr[j + 1], criteria):
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swaps += 1
                step_entry["action"] = "swap"
            steps.append(step_entry)

    elapsed = (time.perf_counter() - t0) * 1000
    return {
        "sortedStations": arr,
        "comparisons": comparisons,
        "swaps": swaps,
        "executionTimeMs": round(elapsed, 3),
        "steps": steps,
    }


def _fb_selection_sort(data):
    arr = list(data.get("stations", []))
    criteria = data.get("criteria", "name")
    steps = []
    comparisons = swaps = 0
    t0 = time.perf_counter()

    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            comparisons += 1
            steps.append({"step": comparisons, "action": "compare",
                          "indices": [min_idx, j],
                          "values": [_sort_key(arr[min_idx], criteria),
                                     _sort_key(arr[j], criteria)]})
            if _sort_key(arr[j], criteria) < _sort_key(arr[min_idx], criteria):
                min_idx = j
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
            swaps += 1
            steps.append({"step": comparisons, "action": "swap",
                          "indices": [i, min_idx],
                          "values": [_sort_key(arr[i], criteria),
                                     _sort_key(arr[min_idx], criteria)]})

    elapsed = (time.perf_counter() - t0) * 1000
    return {
        "sortedStations": arr,
        "comparisons": comparisons,
        "swaps": swaps,
        "executionTimeMs": round(elapsed, 3),
        "steps": steps,
    }


def _fb_merge_sort(data):
    arr = list(data.get("stations", []))
    criteria = data.get("criteria", "name")
    stats = {"comparisons": 0, "swaps": 0}
    steps = []
    t0 = time.perf_counter()

    def merge_sort_rec(a):
        if len(a) <= 1:
            return a
        mid = len(a) // 2
        left = merge_sort_rec(a[:mid])
        right = merge_sort_rec(a[mid:])
        return merge(left, right)

    def merge(left, right):
        result = []
        i = j = 0
        while i < len(left) and j < len(right):
            stats["comparisons"] += 1
            steps.append({"step": stats["comparisons"], "action": "compare",
                          "indices": [i, j],
                          "values": [_sort_key(left[i], criteria),
                                     _sort_key(right[j], criteria)]})
            if _sort_key(left[i], criteria) <= _sort_key(right[j], criteria):
                result.append(left[i]); i += 1
            else:
                result.append(right[j]); j += 1
                stats["swaps"] += 1
        result.extend(left[i:])
        result.extend(right[j:])
        return result

    sorted_arr = merge_sort_rec(arr)
    elapsed = (time.perf_counter() - t0) * 1000
    return {
        "sortedStations": sorted_arr,
        "comparisons": stats["comparisons"],
        "swaps": stats["swaps"],
        "executionTimeMs": round(elapsed, 3),
        "steps": steps,
    }


def _fb_quick_sort(data):
    arr = list(data.get("stations", []))
    criteria = data.get("criteria", "name")
    stats = {"comparisons": 0, "swaps": 0}
    steps = []
    t0 = time.perf_counter()

    def qs(a):
        if len(a) <= 1:
            return a
        pivot = a[len(a) // 2]
        left, middle, right = [], [], []
        for x in a:
            stats["comparisons"] += 1
            kx = _sort_key(x, criteria)
            kp = _sort_key(pivot, criteria)
            steps.append({"step": stats["comparisons"], "action": "compare",
                          "indices": [0, 0], "values": [kx, kp]})
            if kx < kp:
                left.append(x)
            elif kx == kp:
                middle.append(x)
            else:
                right.append(x)
                stats["swaps"] += 1
        return qs(left) + middle + qs(right)

    sorted_arr = qs(arr)
    elapsed = (time.perf_counter() - t0) * 1000
    return {
        "sortedStations": sorted_arr,
        "comparisons": stats["comparisons"],
        "swaps": stats["swaps"],
        "executionTimeMs": round(elapsed, 3),
        "steps": steps,
    }


# ---------------------------------------------------------------------------
# Nearest station (Haversine)
# ---------------------------------------------------------------------------

_EARTH_RADIUS_KM = 6371.0


def _haversine(lat1, lon1, lat2, lon2):
    r = _EARTH_RADIUS_KM
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _fb_nearest_station(data):
    user_lat = data.get("userLat", 0)
    user_lon = data.get("userLon", 0)
    stations = data.get("stations", [])
    steps = []
    nearest = None
    min_dist = float("inf")

    for s in stations:
        dist = round(_haversine(user_lat, user_lon, s["latitude"], s["longitude"]), 3)
        is_new_min = dist < min_dist
        steps.append({
            "stationId": s["id"],
            "distance": dist,
            "currentMin": round(min(min_dist, dist), 3),
            "isNewMin": is_new_min,
        })
        if is_new_min:
            min_dist = dist
            nearest = s

    result = {
        "found": nearest is not None,
        "station": nearest,
        "distance": round(min_dist, 3) if nearest else None,
        "steps": steps,
    }
    return result


def _fb_calculate_distances(data):
    user_lat = data.get("userLat", 0)
    user_lon = data.get("userLon", 0)
    stations = data.get("stations", [])
    distances = []
    for s in stations:
        dist = round(_haversine(user_lat, user_lon, s["latitude"], s["longitude"]), 3)
        distances.append({"stationId": s["id"], "stationName": s["name"], "distance": dist})
    distances.sort(key=lambda d: d["distance"])
    return {"distances": distances}


def _fb_stations_in_range(data):
    user_lat = data.get("userLat", 0)
    user_lon = data.get("userLon", 0)
    stations = data.get("stations", [])
    range_km = data.get("rangeKm", 10)
    results = []
    for s in stations:
        dist = round(_haversine(user_lat, user_lon, s["latitude"], s["longitude"]), 3)
        if dist <= range_km:
            results.append({**s, "distance": dist})
    results.sort(key=lambda d: d["distance"])
    return {"stations": results, "count": len(results), "rangeKm": range_km}
