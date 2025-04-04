package command

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/pkg/errs"
)

const (
	maxRetries = 3
	retryDelay = 100 * time.Millisecond
)

type (
	runnerService interface {
		QueueWorkflow(
			ctx context.Context,
			triggerID uuid.UUID,
			sessionID uuid.UUID,
			workflow *model.Workflow,
			inputs map[string]any,
		) error
	}

	retryConfig struct {
		maxRetries  int
		retryDelay  time.Duration
		returnError error
	}
)

// defaultRetryConfig is the default retry configuration for the retryOnConflict function.
//
//nolint:gochecknoglobals
var defaultRetryConfig = retryConfig{
	maxRetries:  maxRetries,
	retryDelay:  retryDelay,
	returnError: errs.InvalidError{Reason: "unable to retry on conflict"},
}

func retryOnConflict(
	ctx context.Context,
	config retryConfig,
	errorType error,
	fn func() error,
) error {
	var lastErr error

	for attempt := range config.maxRetries {
		if attempt > 0 {
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(config.retryDelay):
				// continue after delay
			}
		}

		err := fn()
		if err == nil {
			return nil
		}

		if errors.Is(err, errorType) {
			lastErr = err
			continue
		}

		return err
	}

	return fmt.Errorf("%w: %w", config.returnError, lastErr)
}
