FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN g++ -std=c++17 -O2 -pthread main.cpp -o server

EXPOSE 10000

CMD ["./server"]