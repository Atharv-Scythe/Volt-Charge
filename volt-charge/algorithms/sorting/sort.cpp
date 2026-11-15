#include "sort.h"
#include <chrono>
#include <algorithm> // only for std::swap, NOT std::sort

// ---------- helpers ----------

static json stationsToJsonArray(const std::vector<Station>& stations) {
    json arr = json::array();
    for (auto& s : stations) {
        arr.push_back(s.toJson());
    }
    return arr;
}

// Compare two stations by the given criteria.  Returns true if a < b.
static bool compareByCriteria(const Station& a, const Station& b, const std::string& criteria) {
    if (criteria == "distance")       return a.distance < b.distance;
    if (criteria == "availablePorts")  return a.availablePorts < b.availablePorts;
    if (criteria == "waitingTime")     return a.waitingTime < b.waitingTime;
    /* "name" or default */           return a.name < b.name;
}

static std::string criteriaValue(const Station& s, const std::string& criteria) {
    if (criteria == "distance")       return std::to_string(s.distance);
    if (criteria == "availablePorts")  return std::to_string(s.availablePorts);
    if (criteria == "waitingTime")     return std::to_string(s.waitingTime);
    return s.name;
}

// ---------- Bubble Sort ----------

SortResult bubbleSort(std::vector<Station> stations, const std::string& criteria) {
    SortResult res;
    res.comparisons = 0;
    res.swaps = 0;
    int n = (int)stations.size();
    int stepNum = 0;

    auto start = std::chrono::high_resolution_clock::now();

    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            res.comparisons++;
            stepNum++;

            json step;
            step["step"] = stepNum;
            step["action"] = "compare";
            step["indices"] = json::array({j, j + 1});
            step["values"] = json::array({criteriaValue(stations[j], criteria),
                                          criteriaValue(stations[j + 1], criteria)});

            if (compareByCriteria(stations[j + 1], stations[j], criteria)) {
                std::swap(stations[j], stations[j + 1]);
                res.swaps++;
                step["action"] = "swap";
            }

            step["arrayState"] = stationsToJsonArray(stations);
            res.steps.push_back(step);
        }
    }

    auto end = std::chrono::high_resolution_clock::now();
    res.executionTimeMs = std::chrono::duration<double, std::milli>(end - start).count();
    res.sortedStations = stations;
    return res;
}

// ---------- Selection Sort ----------

SortResult selectionSort(std::vector<Station> stations, const std::string& criteria) {
    SortResult res;
    res.comparisons = 0;
    res.swaps = 0;
    int n = (int)stations.size();
    int stepNum = 0;

    auto start = std::chrono::high_resolution_clock::now();

    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            res.comparisons++;
            stepNum++;

            json step;
            step["step"] = stepNum;
            step["action"] = "compare";
            step["indices"] = json::array({minIdx, j});
            step["values"] = json::array({criteriaValue(stations[minIdx], criteria),
                                          criteriaValue(stations[j], criteria)});
            step["arrayState"] = stationsToJsonArray(stations);
            res.steps.push_back(step);

            if (compareByCriteria(stations[j], stations[minIdx], criteria)) {
                minIdx = j;
            }
        }
        if (minIdx != i) {
            std::swap(stations[i], stations[minIdx]);
            res.swaps++;
            stepNum++;

            json step;
            step["step"] = stepNum;
            step["action"] = "swap";
            step["indices"] = json::array({i, minIdx});
            step["values"] = json::array({criteriaValue(stations[i], criteria),
                                          criteriaValue(stations[minIdx], criteria)});
            step["arrayState"] = stationsToJsonArray(stations);
            res.steps.push_back(step);
        }
    }

    auto end = std::chrono::high_resolution_clock::now();
    res.executionTimeMs = std::chrono::duration<double, std::milli>(end - start).count();
    res.sortedStations = stations;
    return res;
}

// ---------- Merge Sort ----------

static void mergeSortHelper(std::vector<Station>& stations, int left, int right,
                            const std::string& criteria, SortResult& res, int& stepNum) {
    if (left >= right) return;

    int mid = left + (right - left) / 2;
    mergeSortHelper(stations, left, mid, criteria, res, stepNum);
    mergeSortHelper(stations, mid + 1, right, criteria, res, stepNum);

    // Merge
    std::vector<Station> temp;
    int i = left, j = mid + 1;

    while (i <= mid && j <= right) {
        res.comparisons++;
        stepNum++;

        json step;
        step["step"] = stepNum;
        step["action"] = "compare";
        step["indices"] = json::array({i, j});
        step["values"] = json::array({criteriaValue(stations[i], criteria),
                                      criteriaValue(stations[j], criteria)});

        if (compareByCriteria(stations[i], stations[j], criteria) ||
            !compareByCriteria(stations[j], stations[i], criteria)) {
            // stations[i] <= stations[j]
            temp.push_back(stations[i++]);
        } else {
            temp.push_back(stations[j++]);
        }

        step["arrayState"] = stationsToJsonArray(stations);
        res.steps.push_back(step);
    }

    while (i <= mid) temp.push_back(stations[i++]);
    while (j <= right) temp.push_back(stations[j++]);

    for (int k = 0; k < (int)temp.size(); k++) {
        if (stations[left + k].id != temp[k].id) res.swaps++;
        stations[left + k] = temp[k];
    }

    stepNum++;
    json step;
    step["step"] = stepNum;
    step["action"] = "merge";
    step["indices"] = json::array({left, right});
    step["values"] = json::array({std::to_string(left), std::to_string(right)});
    step["arrayState"] = stationsToJsonArray(stations);
    res.steps.push_back(step);
}

SortResult mergeSort(std::vector<Station> stations, const std::string& criteria) {
    SortResult res;
    res.comparisons = 0;
    res.swaps = 0;
    int stepNum = 0;

    auto start = std::chrono::high_resolution_clock::now();
    mergeSortHelper(stations, 0, (int)stations.size() - 1, criteria, res, stepNum);
    auto end = std::chrono::high_resolution_clock::now();

    res.executionTimeMs = std::chrono::duration<double, std::milli>(end - start).count();
    res.sortedStations = stations;
    return res;
}

// ---------- Quick Sort ----------

static int partition(std::vector<Station>& stations, int low, int high,
                     const std::string& criteria, SortResult& res, int& stepNum) {
    Station pivot = stations[high];
    int i = low - 1;

    for (int j = low; j < high; j++) {
        res.comparisons++;
        stepNum++;

        json step;
        step["step"] = stepNum;
        step["action"] = "compare";
        step["indices"] = json::array({j, high});
        step["values"] = json::array({criteriaValue(stations[j], criteria),
                                      criteriaValue(pivot, criteria)});

        if (compareByCriteria(stations[j], pivot, criteria)) {
            i++;
            if (i != j) {
                std::swap(stations[i], stations[j]);
                res.swaps++;
                step["action"] = "swap";
            }
        }

        step["arrayState"] = stationsToJsonArray(stations);
        res.steps.push_back(step);
    }

    std::swap(stations[i + 1], stations[high]);
    if (i + 1 != high) res.swaps++;

    stepNum++;
    json step;
    step["step"] = stepNum;
    step["action"] = "swap";
    step["indices"] = json::array({i + 1, high});
    step["values"] = json::array({criteriaValue(stations[i + 1], criteria),
                                  criteriaValue(stations[high], criteria)});
    step["arrayState"] = stationsToJsonArray(stations);
    res.steps.push_back(step);

    return i + 1;
}

static void quickSortHelper(std::vector<Station>& stations, int low, int high,
                             const std::string& criteria, SortResult& res, int& stepNum) {
    if (low < high) {
        int pi = partition(stations, low, high, criteria, res, stepNum);
        quickSortHelper(stations, low, pi - 1, criteria, res, stepNum);
        quickSortHelper(stations, pi + 1, high, criteria, res, stepNum);
    }
}

SortResult quickSort(std::vector<Station> stations, const std::string& criteria) {
    SortResult res;
    res.comparisons = 0;
    res.swaps = 0;
    int stepNum = 0;

    auto start = std::chrono::high_resolution_clock::now();
    if (!stations.empty()) {
        quickSortHelper(stations, 0, (int)stations.size() - 1, criteria, res, stepNum);
    }
    auto end = std::chrono::high_resolution_clock::now();

    res.executionTimeMs = std::chrono::duration<double, std::milli>(end - start).count();
    res.sortedStations = stations;
    return res;
}
