#include "circular_queue.h"
#include <sstream>

CircularQueue::CircularQueue() : front(0), rear(-1), count(0) {}

json CircularQueue::getQueueState() const {
    json arr = json::array();
    for (int i = 0; i < count; i++) {
        int idx = (front + i) % MAX_QUEUE_SIZE;
        arr.push_back(data[idx].toJson());
    }
    return arr;
}

void CircularQueue::recordStep(const std::string& operation, const std::string& vehicleId, const std::string& message) {
    trace.push_back(json{
        {"operation", operation},
        {"vehicleId", vehicleId},
        {"front", front},
        {"rear", rear},
        {"size", count},
        {"queueState", getQueueState()},
        {"message", message}
    });
}

json CircularQueue::enqueue(const Vehicle& vehicle) {
    if (isFull()) {
        std::string msg = "Queue overflow: cannot enqueue vehicle " + vehicle.id + " — queue is full (" + std::to_string(MAX_QUEUE_SIZE) + "/" + std::to_string(MAX_QUEUE_SIZE) + ")";
        recordStep("enqueue", vehicle.id, msg);
        return json{
            {"success", false},
            {"error", msg},
            {"steps", trace}
        };
    }

    rear = (rear + 1) % MAX_QUEUE_SIZE;
    data[rear] = vehicle;
    count++;

    std::string msg = "Vehicle " + vehicle.id + " enqueued at position " + std::to_string(rear) + ". Queue size: " + std::to_string(count);
    recordStep("enqueue", vehicle.id, msg);

    return json{
        {"success", true},
        {"message", msg},
        {"vehicle", vehicle.toJson()},
        {"queueSize", count},
        {"front", front},
        {"rear", rear},
        {"steps", trace}
    };
}

json CircularQueue::dequeue() {
    if (isEmpty()) {
        std::string msg = "Queue underflow: cannot dequeue — queue is empty";
        recordStep("dequeue", "", msg);
        return json{
            {"success", false},
            {"error", msg},
            {"steps", trace}
        };
    }

    Vehicle removed = data[front];
    std::string msg = "Vehicle " + removed.id + " dequeued from position " + std::to_string(front) + ". Queue size: " + std::to_string(count - 1);
    front = (front + 1) % MAX_QUEUE_SIZE;
    count--;

    recordStep("dequeue", removed.id, msg);

    return json{
        {"success", true},
        {"message", msg},
        {"vehicle", removed.toJson()},
        {"departedVehicle", removed.toJson()},
        {"queueSize", count},
        {"front", front},
        {"rear", rear},
        {"steps", trace}
    };
}

json CircularQueue::peek() const {
    if (isEmpty()) {
        return json{
            {"success", false},
            {"error", "Queue is empty — nothing to peek"}
        };
    }

    return json{
        {"success", true},
        {"vehicle", data[front].toJson()},
        {"frontVehicle", data[front].toJson()},
        {"queueSize", count},
        {"front", front},
        {"rear", rear}
    };
}

bool CircularQueue::isEmpty() const {
    return count == 0;
}

bool CircularQueue::isFull() const {
    return count == MAX_QUEUE_SIZE;
}

int CircularQueue::getSize() const {
    return count;
}

json CircularQueue::displayQueue() const {
    json arr = getQueueState();
    return json{
        {"success", true},
        {"queueSize", count},
        {"front", front},
        {"rear", rear},
        {"isEmpty", isEmpty()},
        {"isFull", isFull()},
        {"vehicles", arr}
    };
}

json CircularQueue::clearQueue() {
    int oldSize = count;
    front = 0;
    rear = -1;
    count = 0;

    std::string msg = "Queue cleared. Removed " + std::to_string(oldSize) + " vehicles.";
    recordStep("clear", "", msg);

    return json{
        {"success", true},
        {"message", msg},
        {"removedCount", oldSize},
        {"steps", trace}
    };
}

json CircularQueue::getStatus() const {
    return json{
        {"queueSize", count},
        {"maxCapacity", MAX_QUEUE_SIZE},
        {"front", front},
        {"rear", rear},
        {"isEmpty", isEmpty()},
        {"isFull", isFull()},
        {"vehicles", getQueueState()}
    };
}
