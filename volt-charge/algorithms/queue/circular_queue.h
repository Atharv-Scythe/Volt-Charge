#ifndef CIRCULAR_QUEUE_H
#define CIRCULAR_QUEUE_H

#include <string>
#include <vector>
#include "../common/json_helper.h"

const int MAX_QUEUE_SIZE = 20;

struct Vehicle {
    std::string id;
    std::string type;
    int batteryPercentage;
    int requiredPercentage;
    int chargingDuration;
    std::string arrivalTime;
    std::string assignedStation;

    json toJson() const {
        return json{
            {"id", id},
            {"type", type},
            {"batteryPercentage", batteryPercentage},
            {"requiredPercentage", requiredPercentage},
            {"chargingDuration", chargingDuration},
            {"arrivalTime", arrivalTime},
            {"assignedStation", assignedStation}
        };
    }

    static Vehicle fromJson(const json& j) {
        Vehicle v;
        v.id = j.value("id", "");
        v.type = j.value("type", "");
        v.batteryPercentage = j.value("batteryPercentage", 0);
        v.requiredPercentage = j.value("requiredPercentage", 100);
        v.chargingDuration = j.value("chargingDuration", 0);
        v.arrivalTime = j.value("arrivalTime", "");
        v.assignedStation = j.value("assignedStation", "");
        return v;
    }
};

class CircularQueue {
private:
    Vehicle data[MAX_QUEUE_SIZE];
    int front;
    int rear;
    int count;
    std::vector<json> trace; // visualization steps

    json getQueueState() const;
    void recordStep(const std::string& operation, const std::string& vehicleId, const std::string& message);

public:
    CircularQueue();

    json enqueue(const Vehicle& vehicle);
    json dequeue();
    json peek() const;
    bool isEmpty() const;
    bool isFull() const;
    int getSize() const;
    json displayQueue() const;
    json clearQueue();
    json getStatus() const;

    const std::vector<json>& getTrace() const { return trace; }
    void clearTrace() { trace.clear(); }
};

#endif // CIRCULAR_QUEUE_H
