#ifndef NEAREST_H
#define NEAREST_H

#include <string>
#include <vector>
#include "../searching/search.h"  // Station struct

// Haversine distance in km
double calculateDistance(double lat1, double lon1, double lat2, double lon2);

// Find nearest station + visualization steps
json findNearestStation(double userLat, double userLon, const std::vector<Station>& stations);

// Calculate distances to all stations
json calculateAllDistances(double userLat, double userLon, const std::vector<Station>& stations);

// Stations within range
json getStationsWithinRange(double userLat, double userLon, const std::vector<Station>& stations, double rangeKm);

#endif // NEAREST_H
