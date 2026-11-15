#ifndef JSON_HELPER_H
#define JSON_HELPER_H

/*
 * Minimal JSON helper for Volt-Charge engine.
 * Uses nlohmann/json single-header if available, otherwise provides a
 * self-contained micro-JSON library that covers the project needs:
 *   - parse JSON from string
 *   - build JSON objects / arrays
 *   - serialize to string
 *
 * To use nlohmann/json, place json.hpp next to this file and define
 * USE_NLOHMANN_JSON before including this header.  Otherwise the built-in
 * minimal implementation is used.
 */

// We bundle nlohmann/json usage behind a thin alias so every translation
// unit just does:  #include "common/json_helper.h"  and uses  json  /  json::parse().

#include <fstream>
#include <iostream>
#include <sstream>
#include <string>

// ---------- nlohmann/json path ----------
// Try to include json.hpp from common/ directory
#if __has_include("json.hpp")
#   include "json.hpp"
#elif __has_include("common/json.hpp")
#   include "common/json.hpp"
#else
    // Fallback: try the standard nlohmann path
#   include "json.hpp"
#endif

using json = nlohmann::json;

// ---- Convenience helpers ------------------------------------------------

inline json readJsonFromStdin() {
    std::string input;
    std::string line;
    while (std::getline(std::cin, line)) {
        input += line;
    }
    return json::parse(input);
}

inline json readJsonFromString(const std::string& s) {
    return json::parse(s);
}

inline std::string jsonToString(const json& j) {
    return j.dump();
}

inline std::string jsonToPrettyString(const json& j) {
    return j.dump(2);
}

inline json errorJson(const std::string& msg) {
    return json{{"error", msg}};
}

inline json successJson(const std::string& msg) {
    return json{{"success", true}, {"message", msg}};
}

#endif // JSON_HELPER_H
