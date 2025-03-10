package config

import (
	"context"
	"fmt"
	"log/slog"
	"net"
	"os"
)

const (
	httpPort = "80"
)

type (
	Server struct {
		Port string
	}

	Redis struct {
		Host     string
		Password string
	}

	Clerk struct {
		SecretKey string
	}

	Postgres struct {
		URL string
	}

	Config struct {
		Server   Server
		Redis    Redis
		Postgres Postgres
		Clerk    Clerk
	}
)

func Load(_ context.Context) Config {
	mustGet("SECRET_KEY")

	host := mustGet("POSTGRES_HOST")
	port := mustGet("POSTGRES_PORT")
	hostPort := net.JoinHostPort(host, port)

	postgresURL := fmt.Sprintf("postgres://%s:%s@%s/%s",
		mustGet("POSTGRES_USER"),
		mustGet("POSTGRES_PASSWORD"),
		hostPort,
		mustGet("POSTGRES_DB"),
	)

	return Config{
		Server: Server{
			Port: httpPort,
		},
		Redis: Redis{
			Host:     mustGet("REDIS_HOST"),
			Password: mustGet("REDIS_PASSWORD"),
		},
		Postgres: Postgres{
			URL: postgresURL,
		},
		Clerk: Clerk{
			SecretKey: mustGet("CLERK_SECRET_KEY"),
		},
	}
}

func mustGet(key string) string {
	value := os.Getenv(key)
	if value == "" {
		slog.Error("missing required environment variable", "key", key)
		os.Exit(1)
	}
	return value
}
