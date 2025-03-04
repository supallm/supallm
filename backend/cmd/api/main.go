package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	"github.com/supallm/core/internal/application"
	"github.com/supallm/core/internal/infra/http"
	"github.com/supallm/core/internal/pkg/config"
	"github.com/supallm/core/internal/pkg/logger"
	"github.com/supallm/core/internal/pkg/server"
)

func main() {
	if err := run(); err != nil {
		slog.Error("failed to run application", "error", err)
		os.Exit(1)
	}
}

func run() error {
	logger.Banner()
	ctx := context.Background()
	conf := config.Load(ctx)

	server := server.New(conf)

	app, err := application.New(ctx, conf)
	if err != nil {
		return fmt.Errorf("failed to create application: %w", err)
	}

	http.NewServer(server, app)
	return server.Start()
}
