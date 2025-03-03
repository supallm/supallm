FROM golang:1.24-bullseye as builder

ARG arg_cgo=0
ARG arg_os=linux
ARG arg_arch=amd64

RUN apt-get update && apt-get install -y git
WORKDIR /src

ENV CGO_ENABLED=${arg_cgo}
ENV GO111MODULE=on
ENV GOOS=${arg_os}
ENV GOARCH=${arg_arch}

COPY go.mod .
COPY go.sum .
RUN go mod download

WORKDIR /src

COPY . .
RUN go build -ldflags="-s -w" -o /app/binary ./cmd/api && chmod +x /app/binary

FROM gcr.io/distroless/static-debian11 as production
COPY --from=builder /app/binary /app/binary

EXPOSE 80
ENTRYPOINT [ "/app/binary" ]
