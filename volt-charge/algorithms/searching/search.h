#ifndef SEARCH_H
#define SEARCH_H

#include <string>
#include <vector>
#include "../common/json_helper.h"

struct Station {
    std::string id;
    std::string name;
    double latitude;
    double longitude;
    double distance;        // from user, computed dynamically
    int availablePorts;
    int totalPorts;
    double waitingTime;     // minutes
    std::string status;     // "available", "busy", "offline"

    json toJson() const {
        return json{
            {"id", id},
            {"name", name},
            {"latitude", latitude},
            {"longitude", longitude},
            {"distance", distance},
            {"availablePorts", availablePorts},
            {"totalPorts", totalPorts},
            {"waitingTime", waitingTime},
            {"status", status}
        };
    }

    static Station fromJson(const json& j) {
        Station s;
        s.id = j.value("id", "");
        s.name = j.value("name", "");
        s.latitude = j.value("latitude", 0.0);
        s.longitude = j.value("longitude", 0.0);
        s.distance = j.value("distance", 0.0);
        s.availablePorts = j.value("availablePorts", 0);
        s.totalPorts = j.value("totalPorts", 0);
        s.waitingTime = j.value("waitingTime", 0.0);
        s.status = j.value("status", "available");
        return s;
    }
};

// Linear search: search by field ("id" or "name"), returns result + steps
json linearSearch(const std::vector<Station>& stations, const std::string& key, const std::string& field);

// Binary search: search sorted array by field ("id" or "name"), returns result + steps
json binarySearch(const std::vector<Station>& stations, const std::string& key, const std::string& field);

#endif // SEARCH_H
