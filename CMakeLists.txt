cmake_minimum_required(VERSION 3.10)
project(little_world_server CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release)
endif()

add_executable(server main.cpp)
target_include_directories(server PRIVATE include)

find_package(Threads REQUIRED)
target_link_libraries(server PRIVATE Threads::Threads)

# Run the server from the project root so its relative "public/" and
# "data/" paths resolve, e.g.:
#   cmake -B build && cmake --build build && ./build/server
