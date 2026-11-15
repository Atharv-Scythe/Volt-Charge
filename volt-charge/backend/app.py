"""
app.py — All-in-One Runner for Volt-Charge Platform.
Executes:
  1. Automated Unit & Integration Tests (19 tests: C++ Engine, Queues, Searching, Sorting, Haversine, CRUD)
  2. Spawns React + Vite Frontend Server (http://localhost:3000)
  3. Launches Python Flask Backend API (http://localhost:5000)
  4. Serves full-stack production build and automatically opens browser
"""

import os
import sys
import time
import atexit
import signal
import threading
import subprocess
import webbrowser
import unittest

# Ensure backend folder is on sys.path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, ".."))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")
DIST_DIR = os.path.join(FRONTEND_DIR, "dist")
TESTS_DIR = os.path.join(PROJECT_ROOT, "tests")

sys.path.insert(0, BACKEND_DIR)

from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from database import db
from routes.stations import stations_bp
from routes.algorithms import algorithms_bp
from routes.analytics import analytics_bp
from services.algorithm_service import engine_available, ENGINE_PATH

app = Flask(__name__, static_folder=DIST_DIR)
# Enable CORS for all routes so Vite frontend on port 3000 can communicate seamlessly
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register API blueprints
app.register_blueprint(stations_bp, url_prefix="/api/stations")
app.register_blueprint(algorithms_bp, url_prefix="/api/algorithms")
app.register_blueprint(analytics_bp, url_prefix="/api/analytics")

# Global reference for frontend process
frontend_proc = None


@app.route("/api/health", methods=["GET"])
def health_check():
    has_engine = engine_available()
    return jsonify({
        "status": "healthy",
        "service": "Volt-Charge API",
        "engine": "cpp_native" if has_engine else "python_fallback",
        "enginePath": ENGINE_PATH,
        "database": "sqlite_ready"
    }), 200


# SPA Frontend Static Hosting (Serves built React app directly on :5000 as well)
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    if path.startswith("api/"):
        return jsonify({"error": "API route not found"}), 404
    file_path = os.path.join(DIST_DIR, path)
    if path and os.path.exists(file_path) and not os.path.isdir(file_path):
        return send_from_directory(DIST_DIR, path)
    index_file = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index_file):
        return send_from_directory(DIST_DIR, "index.html")
    return jsonify({
        "message": "Volt-Charge Backend is running. Frontend dev server is at http://localhost:3000",
        "api": "/api/health"
    }), 200


@app.errorhandler(404)
def not_found(e):
    if request.path.startswith("/api/"):
        return jsonify({"error": "Resource not found"}), 404
    index_file = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index_file):
        return send_from_directory(DIST_DIR, "index.html")
    return jsonify({"error": "Resource not found"}), 404


@app.errorhandler(400)
def bad_request(e):
    return jsonify({"error": "Bad request"}), 400


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500


# ==============================================================================
# ALL-IN-ONE AUTOMATION HELPERS
# ==============================================================================

def run_automated_tests():
    """Runs the 19-test automated test suite."""
    print("\n" + "=" * 70)
    print("  ⚡ [1/3] RUNNING AUTOMATED UNIT & INTEGRATION TEST SUITE ⚡")
    print("=" * 70)
    loader = unittest.TestLoader()
    suite = loader.discover(start_dir=TESTS_DIR, pattern="test_*.py")
    runner = unittest.TextTestRunner(verbosity=1)
    result = runner.run(suite)
    if result.wasSuccessful():
        print(f"  ✅ ALL {result.testsRun} TESTS PASSED SUCCESSFULLY! (100% Pass Rate)\n")
    else:
        print(f"  ⚠️  Completed with {len(result.failures)} failures and {len(result.errors)} errors.\n")


def start_frontend_dev_server():
    """Launches Vite React dev server in a background subprocess."""
    global frontend_proc
    print("=" * 70)
    print("  ⚡ [2/3] STARTING REACT VITE FRONTEND (PORT 3000) ⚡")
    print("=" * 70)

    try:
        # Check npm command availability
        frontend_proc = subprocess.Popen(
            "npm run dev",
            cwd=FRONTEND_DIR,
            shell=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        print("  ✅ React Vite Frontend dev server started (PID: {})".format(frontend_proc.pid))
        print("     URL: http://localhost:3000\n")
    except Exception as e:
        print(f"  ⚠️  Could not start npm dev server: {e}")
        print("     (Serving static production build directly on :5000)\n")


def auto_open_browser():
    """Waits for servers to initialize and opens web browser."""
    time.sleep(2.5)
    target_url = "http://localhost:3000"
    print(f"  🚀 Opening {target_url} in your default browser...")
    webbrowser.open(target_url)


def cleanup():
    """Gracefully terminates background frontend dev server when app.py exits."""
    global frontend_proc
    if frontend_proc:
        try:
            print("\nShutting down frontend server process...")
            subprocess.run(
                f"taskkill /F /T /PID {frontend_proc.pid}",
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        except Exception:
            pass


atexit.register(cleanup)


def signal_handler(sig, frame):
    cleanup()
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)


# ==============================================================================
# MAIN ENTRY POINT
# ==============================================================================

if __name__ == "__main__":
    skip_tests = "--no-tests" in sys.argv
    skip_frontend = "--no-frontend" in sys.argv

    # 1. Initialize SQLite Database
    db.init_db()

    # 2. Run automated test suite (unless skipped)
    if not skip_tests:
        run_automated_tests()

    # 3. Start Frontend dev server in background (unless skipped)
    if not skip_frontend:
        start_frontend_dev_server()
        # Open browser in a background daemon thread
        threading.Thread(target=auto_open_browser, daemon=True).start()

    # 4. Start Flask REST API Server
    port = int(os.environ.get("PORT", 5000))
    has_engine = engine_available()

    print("=" * 70)
    print("  ⚡ [3/3] VOLT-CHARGE BACKEND SERVER ACTIVE ⚡")
    print("=" * 70)
    print(f"  - Backend REST API: http://localhost:{port}")
    print(f"  - Frontend Web UI:  http://localhost:3000 (Dev) or http://localhost:{port} (SPA)")
    print(f"  - Health Endpoint:  http://localhost:{port}/api/health")
    print(f"  - C++ DSA Engine:   {'CONNECTED (' + str(ENGINE_PATH) + ')' if has_engine else 'FALLBACK'}")
    print("=" * 70)
    print("  Press Ctrl+C anytime to stop all servers.\n")

    app.run(host="0.0.0.0", port=port, debug=False)
