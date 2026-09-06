// little world — backend
//
// C++17 server for local use and Render deployment.
//
// Local:
//   ./server
//   -> http://localhost:8080
//
// Render:
//   Uses the PORT environment variable automatically.
//
// API:
//   GET  /api/cats
//   GET  /api/music
//   GET  /api/stats
//   POST /api/stats/pet
//   POST /api/stats/game

#include "include/httpserver.hpp"

#include <cctype>
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <mutex>
#include <sstream>
#include <string>
#include <unordered_map>
#include <utility>

using littleworld::Request;
using littleworld::Response;
using littleworld::Server;
using littleworld::readFile;

namespace {

    // ---------------------------------------------------------------------
    // Tiny JSON helpers
    // ---------------------------------------------------------------------

    std::string extractStringField(
        const std::string& json,
        const std::string& key
    ) {
        std::string needle = "\"" + key + "\"";

        auto pos = json.find(needle);
        if (pos == std::string::npos)
            return "";

        pos = json.find(':', pos);
        if (pos == std::string::npos)
            return "";

        pos = json.find('"', pos);
        if (pos == std::string::npos)
            return "";

        auto end = json.find('"', pos + 1);
        if (end == std::string::npos)
            return "";

        return json.substr(pos + 1, end - pos - 1);
    }

    long extractNumberField(
        const std::string& json,
        const std::string& key,
        long fallback = 0
    ) {
        std::string needle = "\"" + key + "\"";

        auto pos = json.find(needle);
        if (pos == std::string::npos)
            return fallback;

        pos = json.find(':', pos);
        if (pos == std::string::npos)
            return fallback;

        ++pos;

        while (
            pos < json.size() &&
            (json[pos] == ' ' || json[pos] == '\t')
            ) {
            ++pos;
        }

        std::string num;

        while (
            pos < json.size() &&
            (
                std::isdigit(
                    static_cast<unsigned char>(json[pos])
                ) ||
                json[pos] == '-'
                )
            ) {
            num += json[pos];
            ++pos;
        }

        if (num.empty())
            return fallback;

        try {
            return std::stol(num);
        }
        catch (...) {
            return fallback;
        }
    }

    // ---------------------------------------------------------------------
    // Statistics
    // ---------------------------------------------------------------------

    struct GameStat {
        long plays = 0;
        long bestScore = 0;
    };

    class StatsStore {
    public:

        explicit StatsStore(std::string path)
            : path_(std::move(path)) {
            load();
        }

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

        void recordGame(
            const std::string& game,
            long score
        ) {

            std::string snapshot;

            {
                std::lock_guard<std::mutex> lock(mtx_);

                auto& g = games_[game];

                g.plays += 1;

                if (score > g.bestScore) {
                    g.bestScore = score;
                }

                snapshot = toJsonLocked();
            }

            persist(snapshot);
        }

        std::string toJson() {

            std::lock_guard<std::mutex> lock(mtx_);

            return toJsonLocked();
        }

    private:

        std::string toJsonLocked() const {

            std::ostringstream j;

            j << "{";

            // Total pets
            j << "\"totalPets\":"
                << totalPets_
                << ",";

            // Per cat
            j << "\"perCat\":{";

            bool first = true;

            for (const auto& [cat, count] : petCounts_) {

                if (!first)
                    j << ",";

                first = false;

                j << "\""
                    << cat
                    << "\":"
                    << count;
            }

            j << "},";

            // Games
            j << "\"games\":{";

            first = true;

            for (const auto& [name, stat] : games_) {

                if (!first)
                    j << ",";

                first = false;

                j << "\""
                    << name
                    << "\":{"
                    << "\"plays\":"
                    << stat.plays
                    << ","
                    << "\"bestScore\":"
                    << stat.bestScore
                    << "}";
            }

            j << "}";

            j << "}";

            return j.str();
        }

        void persist(const std::string& json) {

            std::ofstream file(
                path_,
                std::ios::trunc
            );

            if (file) {
                file << json;
            }
        }

        void load() {

            std::string content;

            if (!readFile(path_, content))
                return;

            totalPets_ =
                extractNumberField(
                    content,
                    "totalPets",
                    0
                );
        }

    private:

        std::string path_;

        std::mutex mtx_;

        long totalPets_ = 0;

        std::unordered_map<
            std::string,
            long
        > petCounts_;

        std::unordered_map<
            std::string,
            GameStat
        > games_;
    };

} // namespace

// ---------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------

int main(int argc, char** argv) {

    // -------------------------------------------------------------
    // Port selection
    //
    // 1. Render provides PORT environment variable.
    // 2. Command line argument can override it.
    // 3. Otherwise use 8080 locally.
    // -------------------------------------------------------------

    int port = 8080;

    const char* renderPort =
        std::getenv("PORT");

    if (renderPort != nullptr) {

        try {
            port = std::stoi(renderPort);
        }
        catch (...) {
            port = 8080;
        }
    }

    // Command line argument has priority.
    //
    // Example:
    // ./server 3000

    if (argc > 1) {

        try {
            port = std::stoi(argv[1]);
        }
        catch (...) {
            // Keep current port.
        }
    }

    // -------------------------------------------------------------
    // Create server
    // -------------------------------------------------------------

    Server server("public");

    StatsStore stats(
        "data/stats.json"
    );

    // -------------------------------------------------------------
    // GET /api/cats
    // -------------------------------------------------------------

    server.get(
        "/api/cats",
        [](const Request&) {

            std::string content;

            if (!readFile(
                "data/cats.json",
                content
            )) {

                return Response::json(
                    "{\"cats\":[]}",
                    200
                );
            }

            return Response::json(
                content
            );
        }
    );

    // -------------------------------------------------------------
    // GET /api/music
    // -------------------------------------------------------------

    server.get(
        "/api/music",
        [](const Request&) {

            std::string content;

            if (!readFile(
                "data/music.json",
                content
            )) {

                return Response::json(
                    "{\"artist\":\"Jann\",\"tracks\":[]}",
                    200
                );
            }

            return Response::json(
                content
            );
        }
    );

    // -------------------------------------------------------------
    // GET /api/stats
    // -------------------------------------------------------------

    server.get(
        "/api/stats",
        [&stats](const Request&) {

            return Response::json(
                stats.toJson()
            );
        }
    );

    // -------------------------------------------------------------
    // POST /api/stats/pet
    // -------------------------------------------------------------

    server.post(
        "/api/stats/pet",
        [&stats](const Request& req) {

            std::string catId =
                extractStringField(
                    req.body,
                    "catId"
                );

            if (catId.empty()) {
                catId = "unknown";
            }

            stats.recordPet(catId);

            return Response::json(
                stats.toJson()
            );
        }
    );

    // -------------------------------------------------------------
    // POST /api/stats/game
    // -------------------------------------------------------------

    server.post(
        "/api/stats/game",
        [&stats](const Request& req) {

            std::string game =
                extractStringField(
                    req.body,
                    "game"
                );

            long score =
                extractNumberField(
                    req.body,
                    "score",
                    0
                );

            if (game.empty()) {

                return Response::json(
                    "{\"error\":\"missing game\"}",
                    400
                );
            }

            stats.recordGame(
                game,
                score
            );

            return Response::json(
                stats.toJson()
            );
        }
    );

    // -------------------------------------------------------------
    // Start server
    // -------------------------------------------------------------

    std::cout
        << "========================================\n"
        << "        little world server\n"
        << "========================================\n\n"
        << "Listening on port: "
        << port
        << "\n\n"
        << "========================================\n";

    if (!server.listenAndServe(port)) {

        std::cerr
            << "Failed to start server on port "
            << port
            << "\n";

        return 1;
    }

    return 0;
}