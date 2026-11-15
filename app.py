"""
app.py — Workspace root launcher for Volt-Charge Platform.
"""

import os
import sys

backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "volt-charge", "backend")
if not os.path.isdir(backend_dir):
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")

app_py = os.path.join(backend_dir, "app.py")
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

with open(app_py, "r", encoding="utf-8") as f:
    code = compile(f.read(), app_py, "exec")
    exec(code, {"__name__": "__main__", "__file__": app_py})
