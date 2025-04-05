package config

import (
	"context"
	"fmt"
	"log/slog"
	"net"
	"os"
)

const (
	httpPort = "8080"
)

type (
	Server struct {
		Port string
	}

	Redis struct {
		Host     string
		Password string
	}

	Postgres struct {
		URL string
	}

	InitialUser struct {
		Email    string
		Password string
		Name     string
	}

	Auth struct {
		SecretKey   string
		InitialUser InitialUser
	}

	Config struct {
		Server   Server
		Redis    Redis
		Postgres Postgres
		Auth     Auth
	}
)

func Load(_ context.Context) Config {
	secretKey := mustGet("SECRET_KEY")

	host := mustGet("POSTGRES_HOST")
	port := mustGet("POSTGRES_PORT")
	hostPort := net.JoinHostPort(host, port)

	postgresURL := fmt.Sprintf("postgres://%s:%s@%s/%s",
		mustGet("POSTGRES_USER"),
		mustGet("POSTGRES_PASSWORD"),
		hostPort,
		mustGet("POSTGRES_DB"),
	)

	redisHost := fmt.Sprintf("%s:%s",
		mustGet("REDIS_HOST"),
		mustGet("REDIS_PORT"),
	)

	return Config{
		Server: Server{
			Port: httpPort,
		},
		Redis: Redis{
			Host:     redisHost,
			Password: mustGet("REDIS_PASSWORD"),
		},
		Postgres: Postgres{
			URL: postgresURL,
		},
		Auth: Auth{
			SecretKey: secretKey,
			InitialUser: InitialUser{
				Email:    getOrDefault("INITIAL_USER_EMAIL", "admin@supallm.com"),
				Password: getOrDefault("INITIAL_USER_PASSWORD", "supallm123"),
				Name:     getOrDefault("INITIAL_USER_NAME", "admin"),
			},
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

func getOrDefault(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
