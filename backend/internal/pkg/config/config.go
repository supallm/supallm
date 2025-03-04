package config

import (
	"context"
	"fmt"
	"log/slog"
	"os"
)

const (
	httpPort = "80"
)

type (
	Server struct {
		Port string
	}

	Clerk struct {
		SecretKey string
	}

	Postgres struct {
		URL string
	}

	Config struct {
		Server   Server
		Postgres Postgres
		Clerk    Clerk
	}
)

func Load(ctx context.Context) Config {
	postgresURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s",
		mustGet("POSTGRES_USER"),
		mustGet("POSTGRES_PASSWORD"),
		mustGet("POSTGRES_HOST"),
		mustGet("POSTGRES_PORT"),
		mustGet("POSTGRES_DB"),
	)

	return Config{
		Server: Server{
			Port: httpPort,
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
