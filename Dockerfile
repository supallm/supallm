# Unified base image

FROM alpine:latest AS base
WORKDIR /app

# Install required dependencies for all services
RUN apk add --no-cache nodejs npm git

# Setup step
# We copy the schemas.sql file to the db directory
# This will be used in the setup container to initialize the database

WORKDIR /app/db
COPY backend/sql/schemas.sql /app/db/init.sql

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
COPY --from=runner-builder /app/runner/dist /app/runner/dist
COPY --from=runner-builder /app/runner/package.json  /app/runner/package.json
COPY --from=runner-builder /app/runner/node_modules /app/runner/node_modules

# Setup
COPY --from=base /app/db/init.sql /app/db/init.sql

# Expose necessary ports
EXPOSE 80 3000

# Copy entrypoint script and make it executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Default command
CMD ["/entrypoint.sh"]