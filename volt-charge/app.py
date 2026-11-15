"""
app.py — Root launcher for Volt-Charge Platform.
Delegates directly to backend/app.py to execute:
  1. Automated test suite (19 tests)
  2. Frontend React Vite server
  3. Flask backend API
"""

import os
import sys

backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if not os.path.isdir(backend_dir):
    # In case run from d:\DS cp\
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "volt-charge", "backend")

app_py = os.path.join(backend_dir, "app.py")
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

# Run backend/app.py directly
with open(app_py, "r", encoding="utf-8") as f:
    code = compile(f.read(), app_py, "exec")
    exec(code, {"__name__": "__main__", "__file__": app_py})
