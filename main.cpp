// little world — backend
//
// A small C++17 server with no third-party dependencies. It serves the
// static site in public/ and a handful of tiny JSON endpoints:
//
//   GET  /api/cats           -> cat roster (data/cats.json)
//   GET  /api/music          -> Jann playlist metadata (data/music.json)
//   GET  /api/stats          -> current pet/game stats
//   POST /api/stats/pet      -> { "catId": "mochi" }      increments a pet counter
//   POST /api/stats/game     -> { "game": "catch|memory|pet", "score": 12 }
//
// Build:   g++ -std=c++17 -O2 -pthread -Iinclude main.cpp -o server
// Run:     ./server            (serves http://localhost:8080)
//          ./server 3000       (custom port)

#include "include/httpserver.hpp"

#include <cstdlib>
#include <fstream>
#include <mutex>
#include <sstream>
#include <string>
#include <unordered_map>

using littleworld::Request;
using littleworld::Response;
using littleworld::Server;
using littleworld::readFile;

namespace {

// ---------------------------------------------------------------------
// Extremely small JSON helpers. We never need to *parse* arbitrary JSON
// here (the request bodies we accept are tiny and fixed-shape), so a
// couple of string-scanning helpers are enough and keep the binary
// dependency-free.
// ---------------------------------------------------------------------

std::string extractStringField(const std::string& json, const std::string& key) {
    std::string needle = "\"" + key + "\"";
    auto pos = json.find(needle);
    if (pos == std::string::npos) return "";
    pos = json.find(':', pos);
    if (pos == std::string::npos) return "";
    pos = json.find('"', pos);
    if (pos == std::string::npos) return "";
    auto end = json.find('"', pos + 1);
    if (end == std::string::npos) return "";
    return json.substr(pos + 1, end - pos - 1);
}

long extractNumberField(const std::string& json, const std::string& key, long fallback = 0) {
    std::string needle = "\"" + key + "\"";
    auto pos = json.find(needle);
    if (pos == std::string::npos) return fallback;
    pos = json.find(':', pos);
    if (pos == std::string::npos) return fallback;
    ++pos;
    while (pos < json.size() && (json[pos] == ' ')) ++pos;
    std::string num;
    while (pos < json.size() && (isdigit(static_cast<unsigned char>(json[pos])) || json[pos] == '-')) {
        num += json[pos];
        ++pos;
    }
    if (num.empty()) return fallback;
    try {
        return std::stol(num);
    } catch (...) {
        return fallback;
    }
}

// ---------------------------------------------------------------------
// In-memory stats, mirrored to data/stats.json after every change so a
// restart doesn't lose the friend's high scores.
// ---------------------------------------------------------------------

struct GameStat {
    long plays = 0;
    long bestScore = 0;
};

class StatsStore {
public:
    explicit StatsStore(std::string path) : path_(std::move(path)) { load(); }

    void recordPet(const std::string& catId) {
        std::string snapshot;
        {
            std::lock_guard<std::mutex> lock(mtx_);
            petCounts_[catId] += 1;
            totalPets_ += 1;
            snapshot = toJsonLocked();
        }
        persist(snapshot);
    }

    void recordGame(const std::string& game, long score) {
        std::string snapshot;
        {
            std::lock_guard<std::mutex> lock(mtx_);
            auto& g = games_[game];
            g.plays += 1;
            if (score > g.bestScore) g.bestScore = score;
            snapshot = toJsonLocked();
        }
        persist(snapshot);
    }

    std::string toJson() {
        std::lock_guard<std::mutex> lock(mtx_);
        return toJsonLocked();
    }

private:
    // NOTE: must be called with mtx_ already held. It must never itself
    // acquire mtx_ again (std::mutex is non-reentrant) — every public
    // method above takes the lock in its own scope, builds the snapshot
    // string while still holding it, and only calls the *unlocked*
    // persist() after the lock_guard has gone out of scope.
    std::string toJsonLocked() const {
        std::ostringstream j;
        j << "{";
        j << "\"totalPets\":" << totalPets_ << ",";
        j << "\"perCat\":{";
        bool first = true;
        for (auto& [cat, count] : petCounts_) {
            if (!first) j << ",";
            first = false;
            j << "\"" << cat << "\":" << count;
        }
        j << "},";
        j << "\"games\":{";
        first = true;
        for (auto& [name, stat] : games_) {
            if (!first) j << ",";
            first = false;
            j << "\"" << name << "\":{\"plays\":" << stat.plays
              << ",\"bestScore\":" << stat.bestScore << "}";
        }
        j << "}}";
        return j.str();
    }

    void persist(const std::string& json) {
        std::ofstream f(path_, std::ios::trunc);
        if (f) f << json;
    }

    void load() {
        std::string content;
        if (!readFile(path_, content)) return;
        totalPets_ = extractNumberField(content, "totalPets", 0);
        // Per-cat and per-game breakdowns start fresh each run if the
        // file is missing/corrupt; totals are the number the friend
        // actually cares about, and this keeps the loader trivial and
        // crash-proof instead of writing a full JSON parser.
    }

    std::string path_;
    std::mutex mtx_;
    long totalPets_ = 0;
    std::unordered_map<std::string, long> petCounts_;
    std::unordered_map<std::string, GameStat> games_;
};

} // namespace

int main(int argc, char** argv) {
    int port = 8080;
    if (argc > 1) {
        try { port = std::stoi(argv[1]); } catch (...) { /* keep default */ }
    }

    Server server("public");
    StatsStore stats("data/stats.json");

    server.get("/api/cats", [](const Request&) {
        std::string content;
        if (!readFile("data/cats.json", content)) {
            return Response::json("{\"cats\":[]}", 200);
        }
        return Response::json(content);
    });

    server.get("/api/music", [](const Request&) {
        std::string content;
        if (!readFile("data/music.json", content)) {
            return Response::json("{\"artist\":\"Jann\",\"tracks\":[]}", 200);
        }
        return Response::json(content);
    });

    server.get("/api/stats", [&stats](const Request&) {
        return Response::json(stats.toJson());
    });

    server.post("/api/stats/pet", [&stats](const Request& req) {
        std::string catId = extractStringField(req.body, "catId");
        if (catId.empty()) catId = "unknown";
        stats.recordPet(catId);
        return Response::json(stats.toJson());
    });

    server.post("/api/stats/game", [&stats](const Request& req) {
        std::string game = extractStringField(req.body, "game");
        long score = extractNumberField(req.body, "score", 0);
        if (game.empty()) {
            return Response::json("{\"error\":\"missing game\"}", 400);
        }
        stats.recordGame(game, score);
        return Response::json(stats.toJson());
    });

    if (!server.listenAndServe(port)) {
        std::cerr << "Failed to start server on port " << port << "\n";
        return 1;
    }
    return 0;
}
