#include <iostream>
#include <string>
#include <vector>
#include "common/json_helper.h"
#include "queue/circular_queue.h"
#include "searching/search.h"
#include "sorting/sort.h"
#include "nearest_station/nearest.h"

int main(int argc, char* argv[]) {
    try {
        json input;
        
        // Read input from argument or stdin
        if (argc > 1) {
            std::string argStr = argv[1];
            input = json::parse(argStr);
        } else {
            std::string line, fullInput;
            while (std::getline(std::cin, line)) {
                fullInput += line + "\n";
            }
            if (fullInput.empty()) {
                std::cout << json{{"error", "Empty input received"}}.dump() << std::endl;
                return 1;
            }
            input = json::parse(fullInput);
        }

        std::string operation = input.value("operation", "");
        json data = input.value("data", json::object());

        // ----------------- QUEUE OPERATIONS -----------------
        if (operation == "enqueue" || operation == "dequeue" || operation == "peek" ||
            operation == "queue_status" || operation == "clear_queue" || operation == "display_queue") {
            
            CircularQueue q;
            // Pre-populate queue if state provided
            if (data.contains("initialVehicles") && data["initialVehicles"].is_array()) {
                for (const auto& vj : data["initialVehicles"]) {
                    q.enqueue(Vehicle::fromJson(vj));
                }
                q.clearTrace(); // clear setup trace
            }

            if (operation == "enqueue") {
                Vehicle v = Vehicle::fromJson(data["vehicle"]);
                json res = q.enqueue(v);
                std::cout << res.dump() << std::endl;
                return 0;
            } else if (operation == "dequeue") {
                json res = q.dequeue();
                std::cout << res.dump() << std::endl;
                return 0;
            } else if (operation == "peek") {
                json res = q.peek();
                std::cout << res.dump() << std::endl;
                return 0;
            } else if (operation == "clear_queue") {
                json res = q.clearQueue();
                std::cout << res.dump() << std::endl;
                return 0;
            } else if (operation == "display_queue") {
                json res = q.displayQueue();
                std::cout << res.dump() << std::endl;
                return 0;
            } else {
                json res = q.getStatus();
                std::cout << res.dump() << std::endl;
                return 0;
            }
        }

        // ----------------- SEARCH OPERATIONS -----------------
        else if (operation == "linear_search" || operation == "binary_search") {
            std::vector<Station> stations;
            if (data.contains("stations") && data["stations"].is_array()) {
                for (const auto& sj : data["stations"]) {
                    stations.push_back(Station::fromJson(sj));
                }
            }
            std::string key = data.value("key", "");
            std::string field = data.value("field", "id");

            if (operation == "linear_search") {
                json res = linearSearch(stations, key, field);
                std::cout << res.dump() << std::endl;
                return 0;
            } else {
                json res = binarySearch(stations, key, field);
                std::cout << res.dump() << std::endl;
                return 0;
            }
        }

        // ----------------- SORT OPERATIONS -----------------
        else if (operation == "bubble_sort" || operation == "selection_sort" ||
                 operation == "merge_sort" || operation == "quick_sort") {
            std::vector<Station> stations;
            if (data.contains("stations") && data["stations"].is_array()) {
                for (const auto& sj : data["stations"]) {
                    stations.push_back(Station::fromJson(sj));
                }
            }
            std::string criteria = data.value("criteria", "distance");

            SortResult res;
            if (operation == "bubble_sort") {
                res = bubbleSort(stations, criteria);
            } else if (operation == "selection_sort") {
                res = selectionSort(stations, criteria);
            } else if (operation == "merge_sort") {
                res = mergeSort(stations, criteria);
            } else if (operation == "quick_sort") {
                res = quickSort(stations, criteria);
            }

            std::cout << res.toJson().dump() << std::endl;
            return 0;
        }

        // ----------------- NEAREST STATION OPERATIONS -----------------
        else if (operation == "nearest_station" || operation == "calculate_distances" || operation == "stations_in_range") {
            std::vector<Station> stations;
            if (data.contains("stations") && data["stations"].is_array()) {
                for (const auto& sj : data["stations"]) {
                    stations.push_back(Station::fromJson(sj));
                }
            }
            double userLat = data.value("userLat", 28.6139);
            double userLon = data.value("userLon", 77.2090);

            if (operation == "nearest_station") {
                json res = findNearestStation(userLat, userLon, stations);
                std::cout << res.dump() << std::endl;
                return 0;
            } else if (operation == "calculate_distances") {
                json res = calculateAllDistances(userLat, userLon, stations);
                std::cout << res.dump() << std::endl;
                return 0;
            } else if (operation == "stations_in_range") {
                double rangeKm = data.value("rangeKm", 10.0);
                json res = getStationsWithinRange(userLat, userLon, stations, rangeKm);
                std::cout << res.dump() << std::endl;
                return 0;
            }
        }

        // Unknown operation
        std::cout << json{{"error", "Unknown operation: " + operation}}.dump() << std::endl;
        return 1;

    } catch (const std::exception& e) {
        std::cout << json{{"error", std::string("Exception: ") + e.what()}}.dump() << std::endl;
        return 1;
    }
}
