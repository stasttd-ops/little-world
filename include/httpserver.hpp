// httpserver.hpp
// Cross-platform tiny HTTP/1.1 server.
// Windows: Winsock2
// Linux/macOS: POSIX sockets

#pragma once

#include <algorithm>
#include <cctype>
#include <cstring>
#include <fstream>
#include <functional>
#include <iostream>
#include <map>
#include <mutex>
#include <sstream>
#include <string>
#include <thread>
#include <vector>

#ifdef _WIN32
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib")

using socket_t = SOCKET;
using socket_len_t = int;

constexpr socket_t INVALID_SOCKET_T = INVALID_SOCKET;

inline void closeSocket(socket_t s) {
    closesocket(s);
}

inline int socketError() {
    return WSAGetLastError();
}

#else
#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>

using socket_t = int;
using socket_len_t = socklen_t;

constexpr socket_t INVALID_SOCKET_T = -1;

inline void closeSocket(socket_t s) {
    close(s);
}

inline int socketError() {
    return errno;
}
#endif


namespace littleworld {

    struct Request {
        std::string method;
        std::string path;
        std::string query;
        std::string body;
        std::map<std::string, std::string> headers;
    };

    struct Response {
        int status = 200;
        std::string content_type = "text/plain; charset=utf-8";
        std::string body;
        std::map<std::string, std::string> extra_headers;

        static Response json(const std::string& body, int status = 200) {
            Response r;
            r.status = status;
            r.content_type = "application/json; charset=utf-8";
            r.body = body;
            return r;
        }

        static Response text(const std::string& body, int status = 200) {
            Response r;
            r.status = status;
            r.content_type = "text/plain; charset=utf-8";
            r.body = body;
            return r;
        }

        static Response not_found(
            const std::string& msg = "{\"error\":\"not found\"}"
        ) {
            Response r;
            r.status = 404;
            r.content_type = "application/json; charset=utf-8";
            r.body = msg;
            return r;
        }
    };


    inline std::string statusText(int code) {
        switch (code) {
        case 200: return "OK";
        case 201: return "Created";
        case 204: return "No Content";
        case 400: return "Bad Request";
        case 404: return "Not Found";
        case 405: return "Method Not Allowed";
        case 500: return "Internal Server Error";
        default: return "OK";
        }
    }


    inline std::string mimeFromExt(const std::string& path) {
        auto dot = path.find_last_of('.');

        if (dot == std::string::npos)
            return "application/octet-stream";

        std::string ext = path.substr(dot + 1);

        std::transform(
            ext.begin(),
            ext.end(),
            ext.begin(),
            [](unsigned char c) {
                return static_cast<char>(std::tolower(c));
            }
        );

        static const std::map<std::string, std::string> table = {
            {"html", "text/html; charset=utf-8"},
            {"htm", "text/html; charset=utf-8"},
            {"css", "text/css; charset=utf-8"},
            {"js", "application/javascript; charset=utf-8"},
            {"mjs", "application/javascript; charset=utf-8"},
            {"json", "application/json; charset=utf-8"},
            {"svg", "image/svg+xml"},
            {"png", "image/png"},
            {"jpg", "image/jpeg"},
            {"jpeg", "image/jpeg"},
            {"gif", "image/gif"},
            {"webp", "image/webp"},
            {"ico", "image/x-icon"},
            {"woff", "font/woff"},
            {"woff2", "font/woff2"},
            {"ttf", "font/ttf"},
            {"mp3", "audio/mpeg"},
            {"wav", "audio/wav"},
            {"ogg", "audio/ogg"},
            {"txt", "text/plain; charset=utf-8"},
        };

        auto it = table.find(ext);

        if (it != table.end())
            return it->second;

        return "application/octet-stream";
    }


    inline bool readFile(
        const std::string& path,
        std::string& out
    ) {
        std::ifstream f(path, std::ios::binary);

        if (!f)
            return false;

        std::ostringstream ss;
        ss << f.rdbuf();

        out = ss.str();

        return true;
    }


    inline std::string sanitizePath(const std::string& raw) {
        std::string path = raw;
        std::string clean;

        std::istringstream iss(path);
        std::string seg;

        std::vector<std::string> segs;

        while (std::getline(iss, seg, '/')) {

            if (seg.empty() || seg == ".")
                continue;

            if (seg == "..") {
                if (!segs.empty())
                    segs.pop_back();

                continue;
            }

            segs.push_back(seg);
        }

        for (const auto& s : segs)
            clean += "/" + s;

        return clean;
    }


    class Server {

    public:

        using Handler =
            std::function<Response(const Request&)>;


        explicit Server(std::string staticRoot)
            : staticRoot_(std::move(staticRoot)) {
        }


        void get(
            const std::string& path,
            Handler h
        ) {
            routes_["GET " + path] = std::move(h);
        }


        void post(
            const std::string& path,
            Handler h
        ) {
            routes_["POST " + path] = std::move(h);
        }


        bool listenAndServe(int port) {

#ifdef _WIN32

            // Initialize Winsock
            WSADATA wsaData{};

            int result = WSAStartup(
                MAKEWORD(2, 2),
                &wsaData
            );

            if (result != 0) {
                std::cerr
                    << "WSAStartup failed: "
                    << result
                    << "\n";

                return false;
            }

#endif


            socket_t server_fd =
                socket(
                    AF_INET,
                    SOCK_STREAM,
                    IPPROTO_TCP
                );


            if (server_fd == INVALID_SOCKET_T) {

#ifdef _WIN32
                std::cerr
                    << "socket() failed: "
                    << socketError()
                    << "\n";
                WSACleanup();
#else
                std::perror("socket");
#endif

                return false;
            }


            int opt = 1;

            setsockopt(
                server_fd,
                SOL_SOCKET,
                SO_REUSEADDR,
                reinterpret_cast<const char*>(&opt),
                sizeof(opt)
            );


            sockaddr_in addr{};

            addr.sin_family = AF_INET;

            // IMPORTANT:
            // 0.0.0.0 = listen on all network interfaces.
            //
            // This allows:
            // localhost
            // local IP
            // phone over Wi-Fi

            addr.sin_addr.s_addr = htonl(INADDR_ANY);

            addr.sin_port =
                htons(
                    static_cast<uint16_t>(port)
                );


            if (
                bind(
                    server_fd,
                    reinterpret_cast<sockaddr*>(&addr),
                    sizeof(addr)
                ) < 0
                ) {

#ifdef _WIN32
                std::cerr
                    << "bind() failed: "
                    << socketError()
                    << "\n";

                closeSocket(server_fd);
                WSACleanup();

#else
                std::perror("bind");
                closeSocket(server_fd);
#endif

                return false;
            }


            if (
                listen(
                    server_fd,
                    64
                ) < 0
                ) {

#ifdef _WIN32
                std::cerr
                    << "listen() failed: "
                    << socketError()
                    << "\n";

                closeSocket(server_fd);
                WSACleanup();

#else
                std::perror("listen");
                closeSocket(server_fd);
#endif

                return false;
            }


            std::cout
                << "\n"
                << "========================================\n"
                << "        little world server\n"
                << "========================================\n"
                << "\n"
                << "Local:\n"
                << "  http://localhost:"
                << port
                << "\n"
                << "\n"
                << "Network:\n"
                << "  http://YOUR-PC-IP:"
                << port
                << "\n"
                << "\n"
                << "Make sure your phone and PC are\n"
                << "connected to the same Wi-Fi.\n"
                << "\n"
                << "========================================\n"
                << "\n";


            while (true) {

                sockaddr_in client{};

                socket_len_t clientLen =
                    sizeof(client);


                socket_t client_fd =
                    accept(
                        server_fd,
                        reinterpret_cast<sockaddr*>(&client),
                        &clientLen
                    );


                if (client_fd == INVALID_SOCKET_T)
                    continue;


                std::thread(
                    &Server::handleConnection,
                    this,
                    client_fd
                ).detach();
            }


            closeSocket(server_fd);

#ifdef _WIN32
            WSACleanup();
#endif

            return true;
        }


    private:

        std::string staticRoot_;

        std::map<
            std::string,
            Handler
        > routes_;


        static std::string readAll(socket_t fd) {

            std::string data;

            char buf[8192];

            while (true) {

                int n =
                    recv(
                        fd,
                        buf,
                        sizeof(buf),
                        0
                    );


                if (n <= 0)
                    break;


                data.append(
                    buf,
                    static_cast<size_t>(n)
                );


                if (
                    data.find("\r\n\r\n")
                    != std::string::npos
                    )
                    break;


                if (data.size() > (1 << 20))
                    break;
            }

            return data;
        }


        void handleConnection(socket_t fd) {

            std::string raw =
                readAll(fd);


            if (raw.empty()) {
                closeSocket(fd);
                return;
            }


            Request req;


            size_t headerEnd =
                raw.find("\r\n\r\n");


            std::string headBlob;

            std::string bodySoFar;


            if (headerEnd == std::string::npos) {

                headBlob = raw;

            }
            else {

                headBlob =
                    raw.substr(
                        0,
                        headerEnd
                    );

                bodySoFar =
                    raw.substr(
                        headerEnd + 4
                    );
            }


            std::istringstream headStream(
                headBlob
            );


            std::string requestLine;

            std::getline(
                headStream,
                requestLine
            );


            if (
                !requestLine.empty()
                &&
                requestLine.back() == '\r'
                ) {
                requestLine.pop_back();
            }


            std::istringstream rl(
                requestLine
            );


            std::string fullPath;

            rl
                >> req.method
                >> fullPath;


            auto qpos =
                fullPath.find('?');


            if (qpos == std::string::npos) {

                req.path = fullPath;

            }
            else {

                req.path =
                    fullPath.substr(
                        0,
                        qpos
                    );

                req.query =
                    fullPath.substr(
                        qpos + 1
                    );
            }


            std::string line;

            size_t contentLength = 0;


            while (
                std::getline(
                    headStream,
                    line
                )
                ) {

                if (
                    !line.empty()
                    &&
                    line.back() == '\r'
                    ) {
                    line.pop_back();
                }


                if (line.empty())
                    continue;


                auto colon =
                    line.find(':');


                if (colon == std::string::npos)
                    continue;


                std::string key =
                    line.substr(
                        0,
                        colon
                    );


                std::string val =
                    line.substr(
                        colon + 1
                    );


                while (
                    !val.empty()
                    &&
                    val.front() == ' '
                    ) {
                    val.erase(
                        val.begin()
                    );
                }


                std::transform(
                    key.begin(),
                    key.end(),
                    key.begin(),
                    [](unsigned char c) {
                        return static_cast<char>(
                            std::tolower(c)
                            );
                    }
                );


                req.headers[key] = val;


                if (
                    key == "content-length"
                    ) {

                    try {

                        contentLength =
                            static_cast<size_t>(
                                std::stoul(val)
                                );

                    }
                    catch (...) {

                        contentLength = 0;
                    }
                }
            }


            while (
                bodySoFar.size()
                <
                contentLength
                ) {

                char buf[8192];


                int n =
                    recv(
                        fd,
                        buf,
                        sizeof(buf),
                        0
                    );


                if (n <= 0)
                    break;


                bodySoFar.append(
                    buf,
                    static_cast<size_t>(n)
                );
            }


            req.body =
                bodySoFar.substr(
                    0,
                    contentLength
                );


            Response res;


            try {

                res = route(req);

            }
            catch (
                const std::exception& e
                ) {

                res.status = 500;

                res.content_type =
                    "application/json; charset=utf-8";

                res.body =
                    std::string(
                        "{\"error\":\""
                    )
                    +
                    e.what()
                    +
                    "\"}";
            }


            sendResponse(
                fd,
                res
            );


            closeSocket(fd);
        }


        Response route(
            const Request& req
        ) {

            auto key =
                req.method
                +
                " "
                +
                req.path;


            auto it =
                routes_.find(key);


            if (
                it != routes_.end()
                ) {

                return it->second(req);
            }


            if (
                req.method == "GET"
                ) {

                return serveStatic(
                    req.path
                );
            }


            Response r;

            r.status = 405;

            r.content_type =
                "application/json; charset=utf-8";

            r.body =
                "{\"error\":\"method not allowed\"}";

            return r;
        }


        Response serveStatic(
            std::string path
        ) {

            if (path == "/")
                path = "/index.html";


            std::string safe =
                sanitizePath(path);


            std::string full =
                staticRoot_
                +
                safe;


            std::string content;


            if (
                !readFile(
                    full,
                    content
                )
                ) {

                std::string indexPath =
                    staticRoot_
                    +
                    "/index.html";


                if (
                    readFile(
                        indexPath,
                        content
                    )
                    ) {

                    Response r;

                    r.status = 200;

                    r.content_type =
                        "text/html; charset=utf-8";

                    r.body = content;

                    return r;
                }


                return Response::not_found(
                    "{\"error\":\"file not found\"}"
                );
            }


            Response r;

            r.status = 200;

            r.content_type =
                mimeFromExt(full);

            r.body = content;

            return r;
        }


        void sendResponse(
            socket_t fd,
            const Response& res
        ) {

            std::ostringstream out;


            out
                << "HTTP/1.1 "
                << res.status
                << " "
                << statusText(res.status)
                << "\r\n";


            out
                << "Content-Type: "
                << res.content_type
                << "\r\n";


            out
                << "Content-Length: "
                << res.body.size()
                << "\r\n";


            out
                << "Access-Control-Allow-Origin: *\r\n";


            out
                << "Cache-Control: no-cache\r\n";


            for (
                const auto& [k, v]
                : res.extra_headers
                ) {

                out
                    << k
                    << ": "
                    << v
                    << "\r\n";
            }


            out
                << "Connection: close\r\n"
                << "\r\n";


            out << res.body;


            std::string data =
                out.str();


            size_t sent = 0;


            while (
                sent < data.size()
                ) {

                int n =
                    send(
                        fd,
                        data.data() + sent,
                        static_cast<int>(
                            data.size() - sent
                            ),
                        0
                    );


                if (n <= 0)
                    break;


                sent +=
                    static_cast<size_t>(n);
            }
        }
    };

} // namespace littleworld