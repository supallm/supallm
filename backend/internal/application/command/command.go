package command

import (
	"context"

	"github.com/supallm/core/internal/application/domain/model"
)

type (
	RunnerService interface {
		QueueWorkflow(ctx context.Context, workflow *model.Workflow) error
	}
)
