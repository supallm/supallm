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
)

func main() {
	if err := run(); err != nil {
		slog.Error("failed to run application", "error", err)
		os.Exit(1)
	}
}

func run() error {
	logger.Banner()

	// Create a context that will be canceled on interrupt signals
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	conf := config.Load(ctx)

	server := server.New(conf)

	app, err := application.New(ctx, conf)
	if err != nil {
		return fmt.Errorf("failed to create application: %w", err)
	}

	http.NewServer(server, app)

	serverErrors := make(chan error, 1)
	go func() {
		slog.Info("starting server", "addr", server.Addr())
		serverErrors <- server.Start()
	}()

	select {
	case err := <-serverErrors:
		return fmt.Errorf("server error: %w", err)
	case <-ctx.Done():
		slog.Info("shutdown initiated")
	}

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := server.Stop(shutdownCtx); err != nil {
		return fmt.Errorf("server shutdown failed: %w", err)
	}

	if err := app.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("application shutdown failed: %w", err)
	}

	slog.Info("shutdown complete")
	return nil
}
