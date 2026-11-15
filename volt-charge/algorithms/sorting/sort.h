#ifndef SORT_H
#define SORT_H

#include <string>
#include <vector>
#include "../searching/search.h"  // Station struct

// Sort result with visualization data
struct SortResult {
    std::vector<Station> sortedStations;
    int comparisons;
    int swaps;
    double executionTimeMs;
    std::vector<json> steps;

    json toJson() const {
        json result;
        json arr = json::array();
        for (auto& s : sortedStations) arr.push_back(s.toJson());
        result["sortedStations"] = arr;
        result["comparisons"] = comparisons;
        result["swaps"] = swaps;
        result["executionTimeMs"] = executionTimeMs;
        result["steps"] = steps;
        return result;
    }
};

// All four sorting algorithms — criteria: "distance", "availablePorts", "waitingTime", "name"
SortResult bubbleSort(std::vector<Station> stations, const std::string& criteria);
SortResult selectionSort(std::vector<Station> stations, const std::string& criteria);
SortResult mergeSort(std::vector<Station> stations, const std::string& criteria);
SortResult quickSort(std::vector<Station> stations, const std::string& criteria);

#endif // SORT_H
