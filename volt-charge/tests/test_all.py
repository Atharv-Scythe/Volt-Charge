"""
tests/test_all.py — Automated test suite for Volt-Charge
Tests:
  1. C++ Algorithm Engine (Queue, Searching, Sorting, Nearest Station)
  2. Backend REST API Endpoints (CRUD, Algorithms, Analytics, Health)
  3. Edge cases: Empty datasets, overflow, underflow, invalid inputs
"""

import sys
import os
import json
import unittest
import subprocess

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ENGINE_PATH = os.path.join(PROJECT_ROOT, "algorithms", "volt_engine.exe")

# Add backend to path
sys.path.insert(0, os.path.join(PROJECT_ROOT, "backend"))
from app import app
from database import db


class TestCppEngine(unittest.TestCase):
    """Direct tests against the compiled C++ volt_engine.exe binary."""

    def run_engine(self, operation, data):
        payload = json.dumps({"operation": operation, "data": data})
        proc = subprocess.run(
            [ENGINE_PATH],
            input=payload,
            capture_output=True,
            text=True,
            timeout=5
        )
        self.assertEqual(proc.returncode, 0, f"Engine failed with: {proc.stderr}")
        return json.loads(proc.stdout)

    # ---------- 1. QUEUE TESTS ----------
    def test_queue_enqueue_dequeue_peek(self):
        # Enqueue single vehicle
        v1 = {
            "id": "VH001",
            "type": "Tesla Model 3",
            "batteryPercentage": 20,
            "requiredPercentage": 80,
            "chargingDuration": 35,
            "arrivalTime": "2026-11-15T08:00:00",
            "assignedStation": "ST001"
        }
        res = self.run_engine("enqueue", {"initialVehicles": [], "vehicle": v1})
        self.assertTrue(res.get("success"))
        self.assertEqual(res.get("queueSize"), 1)

        # Dequeue
        res2 = self.run_engine("dequeue", {"initialVehicles": [v1]})
        self.assertTrue(res2.get("success"))
        self.assertEqual(res2.get("departedVehicle", {}).get("id"), "VH001")

        # Peek
        res3 = self.run_engine("peek", {"initialVehicles": [v1]})
        self.assertEqual(res3.get("frontVehicle", {}).get("id"), "VH001")

    def test_queue_underflow(self):
        res = self.run_engine("dequeue", {"initialVehicles": []})
        self.assertFalse(res.get("success"))
        self.assertIn("underflow", res.get("error", "").lower())

    def test_queue_overflow(self):
        # Fill queue to MAX_QUEUE_SIZE (20)
        full_fleet = [{"id": f"VH{i:03d}", "type": "EV", "batteryPercentage": 50, "requiredPercentage": 90, "chargingDuration": 30, "arrivalTime": "", "assignedStation": "ST001"} for i in range(20)]
        extra = {"id": "VH999", "type": "Extra", "batteryPercentage": 10, "requiredPercentage": 80, "chargingDuration": 30, "arrivalTime": "", "assignedStation": "ST001"}
        res = self.run_engine("enqueue", {"initialVehicles": full_fleet, "vehicle": extra})
        self.assertFalse(res.get("success"))
        self.assertIn("overflow", res.get("error", "").lower())

    def test_queue_circular_wraparound(self):
        # Enqueue 5, dequeue 2, enqueue 3 more to test pointer circular wraparound
        fleet = [{"id": f"VH{i}", "type": "EV", "batteryPercentage": 50, "requiredPercentage": 90, "chargingDuration": 30, "arrivalTime": "", "assignedStation": "ST001"} for i in range(5)]
        # After dequeuing 2, front moves to 2, size is 3
        # Then enqueueing new vehicle should place it at (rear + 1) % MAX_SIZE
        new_v = {"id": "VH_WRAP", "type": "EV", "batteryPercentage": 30, "requiredPercentage": 80, "chargingDuration": 25, "arrivalTime": "", "assignedStation": "ST001"}
        res = self.run_engine("enqueue", {"initialVehicles": fleet[2:], "vehicle": new_v})
        self.assertTrue(res.get("success"))
        self.assertEqual(res.get("queueSize"), 4)

    def test_search_first_and_last_element(self):
        stations = [
            {"id": "ST001", "name": "First Station"},
            {"id": "ST002", "name": "Middle Station"},
            {"id": "ST003", "name": "Last Station"}
        ]
        # First element
        res_first = self.run_engine("linear_search", {"stations": stations, "key": "ST001", "field": "id"})
        self.assertEqual(res_first.get("index"), 0)
        self.assertEqual(res_first.get("totalComparisons"), 1)

        # Last element
        res_last = self.run_engine("linear_search", {"stations": stations, "key": "ST003", "field": "id"})
        self.assertEqual(res_last.get("index"), 2)
        self.assertEqual(res_last.get("totalComparisons"), 3)

    def test_haversine_identical_coordinates(self):
        # User and station have exact same coordinates -> distance should be 0.0 km
        stations = [{"id": "ST001", "name": "Same Spot", "latitude": 28.6139, "longitude": 77.2090}]
        res = self.run_engine("nearest_station", {
            "userLat": 28.6139,
            "userLon": 77.2090,
            "stations": stations
        })
        self.assertTrue(res.get("found"))
        self.assertAlmostEqual(res.get("distance", 999), 0.0, places=1)

    # ---------- 2. SEARCHING TESTS ----------
    def test_linear_search_found(self):
        stations = [
            {"id": "ST001", "name": "Alpha Station"},
            {"id": "ST002", "name": "Beta Station"},
            {"id": "ST003", "name": "Gamma Station"}
        ]
        res = self.run_engine("linear_search", {"stations": stations, "key": "ST002", "field": "id"})
        self.assertTrue(res.get("found"))
        self.assertEqual(res.get("index"), 1)
        self.assertEqual(res.get("totalComparisons"), 2)

    def test_linear_search_not_found(self):
        stations = [{"id": "ST001", "name": "Alpha"}]
        res = self.run_engine("linear_search", {"stations": stations, "key": "ST999", "field": "id"})
        self.assertFalse(res.get("found"))
        self.assertEqual(res.get("index"), -1)

    def test_binary_search_found(self):
        # Sorted by id
        stations = [
            {"id": "ST001", "name": "Alpha"},
            {"id": "ST002", "name": "Beta"},
            {"id": "ST003", "name": "Gamma"},
            {"id": "ST004", "name": "Delta"},
            {"id": "ST005", "name": "Epsilon"}
        ]
        res = self.run_engine("binary_search", {"stations": stations, "key": "ST004", "field": "id"})
        self.assertTrue(res.get("found"))
        self.assertEqual(res.get("index"), 3)

    def test_search_empty_dataset(self):
        res = self.run_engine("linear_search", {"stations": [], "key": "ST001", "field": "id"})
        self.assertFalse(res.get("found"))
        res_bin = self.run_engine("binary_search", {"stations": [], "key": "ST001", "field": "id"})
        self.assertFalse(res_bin.get("found"))

    # ---------- 3. SORTING TESTS ----------
    def test_all_sorting_algorithms(self):
        raw = [
            {"id": "ST003", "name": "C", "waitingTime": 30.0, "availablePorts": 2, "distance": 15.0},
            {"id": "ST001", "name": "A", "waitingTime": 10.0, "availablePorts": 5, "distance": 5.0},
            {"id": "ST002", "name": "B", "waitingTime": 20.0, "availablePorts": 3, "distance": 10.0}
        ]

        algorithms = ["bubble_sort", "selection_sort", "merge_sort", "quick_sort"]
        for alg in algorithms:
            with self.subTest(alg=alg):
                res = self.run_engine(alg, {"stations": raw, "criteria": "waitingTime"})
                sorted_list = res.get("sortedStations", [])
                self.assertEqual(len(sorted_list), 3)
                # Verify ascending waiting times: 10, 20, 30
                times = [s["waitingTime"] for s in sorted_list]
                self.assertEqual(times, [10.0, 20.0, 30.0])
                self.assertGreaterEqual(res.get("comparisons", 0), 1)

    def test_sorting_edge_cases(self):
        # Single element
        single = [{"id": "ST001", "name": "Solo", "waitingTime": 12.0}]
        res = self.run_engine("quick_sort", {"stations": single, "criteria": "waitingTime"})
        self.assertEqual(len(res.get("sortedStations", [])), 1)

        # Empty dataset
        empty_res = self.run_engine("merge_sort", {"stations": [], "criteria": "waitingTime"})
        self.assertEqual(len(empty_res.get("sortedStations", [])), 0)

        # Reverse sorted
        rev = [{"id": "ST3", "name": "Z", "distance": 30.0}, {"id": "ST2", "name": "Y", "distance": 20.0}, {"id": "ST1", "name": "X", "distance": 10.0}]
        res_rev = self.run_engine("bubble_sort", {"stations": rev, "criteria": "distance"})
        distances = [s["distance"] for s in res_rev["sortedStations"]]
        self.assertEqual(distances, [10.0, 20.0, 30.0])

    # ---------- 4. NEAREST STATION (HAVERSINE) ----------
    def test_haversine_nearest_station(self):
        stations = [
            {"id": "ST001", "name": "Far", "latitude": 28.0000, "longitude": 77.0000},
            {"id": "ST002", "name": "Near", "latitude": 28.6140, "longitude": 77.2092} # very close to (28.6139, 77.2090)
        ]
        res = self.run_engine("nearest_station", {
            "userLat": 28.6139,
            "userLon": 77.2090,
            "stations": stations
        })
        self.assertTrue(res.get("found"))
        self.assertEqual(res.get("station", {}).get("id"), "ST002")
        self.assertLess(res.get("distance", 999), 1.0) # Less than 1km


class TestBackendAPI(unittest.TestCase):
    """Integration tests for Flask REST API routes."""

    @classmethod
    def setUpClass(cls):
        app.config["TESTING"] = True
        cls.client = app.test_client()
        db.init_db()

    def test_health_endpoint(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get("status"), "healthy")
        self.assertEqual(data.get("engine"), "cpp_native")

    def test_get_stations(self):
        res = self.client.get("/api/stations")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_station_missing_fields_validation(self):
        # Missing name and location
        incomplete = {"id": "ST_INCOMPLETE", "latitude": 28.5}
        res = self.client.post("/api/stations", json=incomplete)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Missing required field", res.get_json().get("error", ""))

    def test_station_crud_lifecycle(self):
        # 1. Create
        new_station = {
            "id": "ST_TEST_99",
            "name": "Integration Test Hub",
            "location": "Sector 62, Noida",
            "latitude": 28.6280,
            "longitude": 77.3649,
            "chargingType": "DC Fast",
            "totalPorts": 10,
            "availablePorts": 7,
            "chargingRate": 150,
            "waitingTime": 10
        }
        create_res = self.client.post("/api/stations", json=new_station)
        self.assertEqual(create_res.status_code, 201)

        # 2. Read single
        get_res = self.client.get("/api/stations/ST_TEST_99")
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.get_json()["name"], "Integration Test Hub")

        # 3. Update
        update_res = self.client.put("/api/stations/ST_TEST_99", json={"availablePorts": 8})
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.get_json()["availablePorts"], 8)

        # 4. Delete
        del_res = self.client.delete("/api/stations/ST_TEST_99")
        self.assertEqual(del_res.status_code, 200)

        # Verify 404 after delete
        not_found_res = self.client.get("/api/stations/ST_TEST_99")
        self.assertEqual(not_found_res.status_code, 404)

    def test_algorithms_endpoints(self):
        # Nearest
        near_res = self.client.post("/api/algorithms/nearest", json={
            "userLat": 28.6139,
            "userLon": 77.2090
        })
        self.assertEqual(near_res.status_code, 200)
        self.assertIn("station", near_res.get_json())

        # Sort
        sort_res = self.client.post("/api/algorithms/sort", json={
            "algorithm": "quick_sort",
            "criteria": "waitingTime"
        })
        self.assertEqual(sort_res.status_code, 200)
        self.assertIn("sortedStations", sort_res.get_json())

        # Search
        search_res = self.client.post("/api/algorithms/search", json={
            "algorithm": "linear_search",
            "key": "ST001",
            "field": "id"
        })
        self.assertEqual(search_res.status_code, 200)
        self.assertTrue(search_res.get_json().get("found"))

    def test_analytics_endpoint(self):
        res = self.client.get("/api/analytics")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("totalStations", data)
        self.assertIn("stationUtilization", data)
        self.assertIn("chargingCompletions", data)
        self.assertIn("algorithmBenchmarks", data)


if __name__ == "__main__":
    unittest.main(verbosity=2)
