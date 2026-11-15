cmake_minimum_required(VERSION 3.10)
project(volt_engine CXX)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/common
    ${CMAKE_CURRENT_SOURCE_DIR}/queue
    ${CMAKE_CURRENT_SOURCE_DIR}/searching
    ${CMAKE_CURRENT_SOURCE_DIR}/sorting
    ${CMAKE_CURRENT_SOURCE_DIR}/nearest_station
)

add_executable(volt_engine
    main.cpp
    queue/circular_queue.cpp
    searching/search.cpp
    sorting/sort.cpp
    nearest_station/nearest.cpp
)
