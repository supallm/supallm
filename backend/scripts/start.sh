#!/bin/sh

golangci-lint run && \
go test -p 8 -parallel=4 ./... && \
CGO_ENABLED=1 go run -race ./cmd/api/
