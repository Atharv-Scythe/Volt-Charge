#include "nearest.h"
#include <cmath>
#include <limits>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

static const double EARTH_RADIUS_KM = 6371.0;

static double toRadians(double degrees) {
    return degrees * M_PI / 180.0;
}

double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    double dLat = toRadians(lat2 - lat1);
    double dLon = toRadians(lon2 - lon1);

    double a = std::sin(dLat / 2.0) * std::sin(dLat / 2.0) +
               std::cos(toRadians(lat1)) * std::cos(toRadians(lat2)) *
               std::sin(dLon / 2.0) * std::sin(dLon / 2.0);

    double c = 2.0 * std::atan2(std::sqrt(a), std::sqrt(1.0 - a));

    return EARTH_RADIUS_KM * c;
}

json findNearestStation(double userLat, double userLon, const std::vector<Station>& stations) {
    if (stations.empty()) {
        return json{
            {"found", false},
            {"error", "No stations provided"},
            {"steps", json::array()}
        };
    }

    json steps = json::array();
    double minDist = std::numeric_limits<double>::max();
    int nearestIdx = -1;

    for (size_t i = 0; i < stations.size(); i++) {
        double dist = calculateDistance(userLat, userLon, stations[i].latitude, stations[i].longitude);
        bool isNewMin = (dist < minDist);

        if (isNewMin) {
            minDist = dist;
            nearestIdx = (int)i;
        }

        steps.push_back(json{
            {"stationId", stations[i].id},
            {"stationName", stations[i].name},
            {"distance", std::round(dist * 100.0) / 100.0},
            {"currentMin", std::round(minDist * 100.0) / 100.0},
            {"isNewMin", isNewMin}
        });
    }

    Station nearest = stations[nearestIdx];

    return json{
        {"found", true},
        {"station", nearest.toJson()},
        {"distance", std::round(minDist * 100.0) / 100.0},
        {"steps", steps}
    };
}

json calculateAllDistances(double userLat, double userLon, const std::vector<Station>& stations) {
    json results = json::array();

    for (auto& s : stations) {
        double dist = calculateDistance(userLat, userLon, s.latitude, s.longitude);
        json entry = s.toJson();
        entry["calculatedDistance"] = std::round(dist * 100.0) / 100.0;
        results.push_back(entry);
    }

    return json{
        {"success", true},
        {"distances", results},
        {"count", (int)stations.size()}
    };
}

json getStationsWithinRange(double userLat, double userLon, const std::vector<Station>& stations, double rangeKm) {
    json results = json::array();
    json allChecked = json::array();

    for (auto& s : stations) {
        double dist = calculateDistance(userLat, userLon, s.latitude, s.longitude);
        bool inRange = (dist <= rangeKm);

        json entry = s.toJson();
        entry["calculatedDistance"] = std::round(dist * 100.0) / 100.0;
        entry["inRange"] = inRange;
        allChecked.push_back(entry);

        if (inRange) {
            results.push_back(entry);
        }
    }

    return json{
        {"success", true},
        {"stationsInRange", results},
        {"count", (int)results.size()},
        {"totalChecked", (int)stations.size()},
        {"rangeKm", rangeKm},
        {"allChecked", allChecked}
    };
}
