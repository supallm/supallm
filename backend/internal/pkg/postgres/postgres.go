package postgres

import (
	"context"
	"log/slog"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/supallm/core/internal/pkg/config"
)

func NewClient(ctx context.Context, conf config.Postgres) *pgxpool.Pool {
	pool, err := pgxpool.New(ctx, conf.URL)
	if err != nil {
		slog.Error("failed to create pgxpool", "error", err)
		os.Exit(1)
	}
	err = pool.Ping(ctx)
	if err != nil {
		slog.Error("failed to ping database", "error", err)
		os.Exit(1)
	}

	return pool
}
