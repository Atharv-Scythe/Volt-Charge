#include "search.h"

json linearSearch(const std::vector<Station>& stations, const std::string& key, const std::string& field) {
    json steps = json::array();
    json result;
    bool found = false;

    for (size_t i = 0; i < stations.size(); i++) {
        std::string compared;
        if (field == "id") {
            compared = stations[i].id;
        } else {
            compared = stations[i].name;
        }

        bool match = (compared == key);

        steps.push_back(json{
            {"index", (int)i},
            {"stationId", stations[i].id},
            {"compared", compared},
            {"match", match}
        });

        if (match) {
            found = true;
            result["found"] = true;
            result["station"] = stations[i].toJson();
            result["index"] = (int)i;
            result["steps"] = steps;
            result["totalComparisons"] = (int)(i + 1);
            result["message"] = "Station found at index " + std::to_string(i) + " after " + std::to_string(i + 1) + " comparison(s)";
            return result;
        }
    }

    result["found"] = false;
    result["station"] = nullptr;
    result["index"] = -1;
    result["steps"] = steps;
    result["totalComparisons"] = (int)stations.size();
    result["message"] = "Station with " + field + " '" + key + "' not found after " + std::to_string(stations.size()) + " comparison(s)";
    return result;
}

json binarySearch(const std::vector<Station>& stations, const std::string& key, const std::string& field) {
    json steps = json::array();
    json result;

    int low = 0;
    int high = (int)stations.size() - 1;
    int comparisons = 0;

    while (low <= high) {
        int mid = low + (high - low) / 2;
        comparisons++;

        std::string midValue;
        if (field == "id") {
            midValue = stations[mid].id;
        } else {
            midValue = stations[mid].name;
        }

        bool match = (midValue == key);

        steps.push_back(json{
            {"low", low},
            {"high", high},
            {"mid", mid},
            {"midValue", midValue},
            {"compared", key},
            {"match", match}
        });

        if (midValue == key) {
            result["found"] = true;
            result["station"] = stations[mid].toJson();
            result["index"] = mid;
            result["steps"] = steps;
            result["totalComparisons"] = comparisons;
            result["message"] = "Station found at index " + std::to_string(mid) + " after " + std::to_string(comparisons) + " comparison(s)";
            return result;
        } else if (midValue < key) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    result["found"] = false;
    result["station"] = nullptr;
    result["index"] = -1;
    result["steps"] = steps;
    result["totalComparisons"] = comparisons;
    result["message"] = "Station with " + field + " '" + key + "' not found after " + std::to_string(comparisons) + " comparison(s)";
    return result;
}
