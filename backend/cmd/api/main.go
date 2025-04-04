package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/supallm/core/internal/application"
	"github.com/supallm/core/internal/infra/http"
	"github.com/supallm/core/internal/pkg/config"
	"github.com/supallm/core/internal/pkg/logger"
	"github.com/supallm/core/internal/pkg/server"
	"github.com/supallm/core/sql"
)

const (
	timeout = 10 * time.Second
)

func main() {
	if err := run(); err != nil {
		slog.Error("failed to run application", "error", err)
		os.Exit(1)
	}
}

func run() error {
	logger.Banner()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	conf := config.Load(ctx)

	if err := sql.RunMigrations(conf.Postgres); err != nil {
		return fmt.Errorf("failed to run database migrations: %w", err)
	}

	server := server.New(conf)

	app, err := application.New(ctx, conf)
	if err != nil {
		return fmt.Errorf("failed to create application: %w", err)
	}

	http.AddHandlers(server, app)
	serverErrors := make(chan error, 1)
	go func() {
		serverErrors <- server.Start()
	}()

	select {
	case err = <-serverErrors:
		return fmt.Errorf("server error: %w", err)
	case <-ctx.Done():
		slog.Info("shutdown initiated")
	}

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), timeout)
	defer shutdownCancel()

	if err = server.Stop(shutdownCtx); err != nil {
		return fmt.Errorf("server shutdown failed: %w", err)
	}

	if err = app.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("application shutdown failed: %w", err)
	}

	slog.Info("shutdown complete")
	return nil
}
