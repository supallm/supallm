# Unified base image

FROM alpine:latest AS base
WORKDIR /app

# Install required dependencies for all services
RUN apk add --no-cache nodejs npm git

# _                _                  _ 
# | |__   __ _  ___| | _____ _ __   __| |
# | '_ \ / _` |/ __| |/ / _ \ '_ \ / _` |
# | |_) | (_| | (__|   <  __/ | | | (_| |
# |_.__/ \__,_|\___|_|\_\___|_| |_|\__,_|

FROM golang:1.24-alpine AS api-builder
WORKDIR /app/backend

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .

RUN go build -o /app/server ./cmd/api/main.go

# __                 _                 _ 
# / _|_ __ ___  _ __ | |_ ___ _ __   __| |
# | |_| '__/ _ \| '_ \| __/ _ \ '_ \ / _` |
# |  _| | | (_) | | | | ||  __/ | | | (_| |
# |_| |_|  \___/|_| |_|\__\___|_| |_|\__,_|

FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm install

COPY ./frontend ./

RUN npm run build

RUN npm prune --production

# _ __ _   _ _ __  _ __   ___ _ __ 
# | '__| | | | '_ \| '_ \ / _ \ '__|
# | |  | |_| | | | | | | |  __/ |   
# |_|   \__,_|_| |_|_| |_|\___|_|   

FROM debian:bookworm-slim AS runner-builder

WORKDIR /nsjail

RUN apt-get -y update \
    && apt-get install -y \
    bison=2:3.8.* \
    flex=2.6.* \
    g++=4:12.2.* \
    gcc=4:12.2.* \
    git=1:2.39.* \
    libprotobuf-dev=3.21.* \
    libnl-route-3-dev=3.7.* \
    make=4.3-4.1 \
    pkg-config=1.8.* \
    protobuf-compiler=3.21.*

RUN git clone -b master --single-branch https://github.com/google/nsjail.git .

RUN make

RUN ls -la

RUN cp /nsjail/nsjail /usr/local/bin/nsjail
RUN chmod +x /usr/local/bin/nsjail

WORKDIR /app/runner

RUN apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

RUN npm install -g typescript

COPY ./runner/package*.json ./

RUN npm ci

COPY ./runner .

RUN npm run build


# _____ ___ _   _    _    _     
# |  ___|_ _| \ | |  / \  | |    
# | |_   | ||  \| | / _ \ | |    
# |  _|  | || |\  |/ ___ \| |___ 
# |_|   |___|_| \_/_/   \_\_____|

FROM debian:bookworm-slim AS final
WORKDIR /app

# Backend
COPY --from=api-builder /app/server /app/server

# Frontend
COPY --from=frontend-builder /app/frontend/package.json /app/frontend/package.json
COPY --from=frontend-builder /app/frontend/node_modules /app/frontend/node_modules
COPY --from=frontend-builder /app/frontend/.next /app/frontend/.next
COPY --from=frontend-builder /app/frontend/public /app/frontend/public

# Runner
RUN apt-get update && apt-get install -y \
    libprotobuf-dev \
    libnl-route-3-200 \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

RUN npm install -g typescript

COPY --from=runner-builder /app/runner/dist /app/runner/dist
COPY --from=runner-builder /app/runner/package.json  /app/runner/package.json
COPY --from=runner-builder /app/runner/node_modules /app/runner/node_modules
COPY --from=runner-builder /usr/local/bin/nsjail /usr/local/bin/nsjail

# Expose necessary ports
EXPOSE 8080 3000

# Copy entrypoint script and make it executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Default command
CMD ["/entrypoint.sh"]