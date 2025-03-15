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

FROM node:lts-alpine AS runner-builder
WORKDIR /app/runner

COPY ./runner/package*.json ./
RUN npm install

COPY ./runner .

RUN npm run build

# _____ ___ _   _    _    _     
# |  ___|_ _| \ | |  / \  | |    
# | |_   | ||  \| | / _ \ | |    
# |  _|  | || |\  |/ ___ \| |___ 
# |_|   |___|_| \_/_/   \_\_____|

FROM node:lts-alpine AS final
WORKDIR /app

# Backend
COPY --from=api-builder /app/server /app/server

# Frontend
COPY --from=frontend-builder /app/frontend/package.json /app/frontend/package.json
COPY --from=frontend-builder /app/frontend/node_modules /app/frontend/node_modules
COPY --from=frontend-builder /app/frontend/.next /app/frontend/.next
COPY --from=frontend-builder /app/frontend/public /app/frontend/public

# Runner
COPY --from=runner-builder /app/runner /app/runner

# Expose necessary ports
EXPOSE 80 3000 50051

# Copy entrypoint script and make it executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Default command
CMD ["/entrypoint.sh"]