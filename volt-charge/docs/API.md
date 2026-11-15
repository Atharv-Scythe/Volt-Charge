# Volt-Charge: REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. System Health

### `GET /health`
Returns the status of the Flask backend, SQLite database connection, and the availability of the native C++ algorithm engine.

#### Response `200 OK`
```json
{
  "database": "sqlite_ready",
  "engine": "cpp_native",
  "enginePath": "d:\\DS cp\\volt-charge\\algorithms\\volt_engine.exe",
  "service": "Volt-Charge API",
  "status": "healthy"
}
```

---

## 2. Station Management

### `GET /stations`
List all charging stations with optional filtering and sorting.

#### Query Parameters:
- `search` (string): Keyword match on ID, name, or locality
- `chargingType` (string): "DC Fast" or "Level 2"
- `available` (boolean): If `true`, returns only stations with available ports > 0
- `sortBy` (string): "distance", "waitingTime", "availablePorts", or "name"

---

### `GET /stations/:id`
Fetch a single charging station by ID.

#### Response `200 OK`
```json
{
  "availablePorts": 5,
  "chargingRate": 150.0,
  "chargingType": "DC Fast",
  "id": "ST001",
  "latitude": 28.6315,
  "location": "Connaught Place, New Delhi",
  "longitude": 77.2167,
  "name": "GreenVolt Central Hub",
  "status": "active",
  "totalPorts": 8,
  "waitingTime": 12
}
```

---

### `POST /stations`
Create a new charging station record.

#### Request Body
```json
{
  "id": "ST016",
  "name": "CyberHub Power Depot",
  "location": "DLF Cyber City, Gurugram",
  "latitude": 28.4950,
  "longitude": 77.0890,
  "chargingType": "DC Fast",
  "totalPorts": 12,
  "availablePorts": 8,
  "chargingRate": 200,
  "waitingTime": 5
}
```

---

### `PUT /stations/:id`
Update an existing station's details (partial update allowed).

---

### `DELETE /stations/:id`
Delete a charging station record from the database.

---

## 3. Algorithm Engine Endpoints

### `POST /algorithms/nearest`
Computes great-circle distances via Haversine formula and returns the closest station with step-by-step iteration logs.

#### Request Body
```json
{
  "userLat": 28.6139,
  "userLon": 77.2090
}
```

#### Response `200 OK`
```json
{
  "distance": 2.1,
  "found": true,
  "station": { ... },
  "steps": [
    { "currentMin": 2.1, "distance": 2.1, "isNewMin": true, "stationId": "ST001" },
    { "currentMin": 2.1, "distance": 9.95, "isNewMin": false, "stationId": "ST002" }
  ]
}
```

---

### `POST /algorithms/search`
Executes Linear Search or Binary Search.

#### Request Body
```json
{
  "algorithm": "binary_search",
  "key": "ST005",
  "field": "id"
}
```

---

### `POST /algorithms/sort`
Executes Bubble, Selection, Merge, or Quick Sort.

#### Request Body
```json
{
  "algorithm": "quick_sort",
  "criteria": "waitingTime",
  "datasetSize": 50
}
```

---

### `POST /algorithms/queue`
Dispatches Circular Queue operations.

#### Operations:
- `{"operation": "status"}`
- `{"operation": "enqueue", "vehicle": { "id": "VH010", ... }}`
- `{"operation": "dequeue"}`
- `{"operation": "peek"}`
- `{"operation": "clear"}`

---

## 4. Telemetry & Analytics

### `GET /analytics`
Returns dashboard KPIs, charger utilization rates, weekly session trends, and algorithm benchmark data.
