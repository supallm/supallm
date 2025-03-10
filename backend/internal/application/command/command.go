package command

import (
	"context"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
)

type (
	RunnerService interface {
		QueueWorkflow(ctx context.Context, triggerID uuid.UUID, workflow *model.Workflow, inputs map[string]any) error
	}
)
