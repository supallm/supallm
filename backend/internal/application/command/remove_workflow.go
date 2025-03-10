package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/repository"
)

type RemoveWorkflowCommand struct {
	ProjectID  uuid.UUID
	WorkflowID uuid.UUID
}

type RemoveWorkflowHandler struct {
	projectRepo repository.ProjectRepository
}

func NewRemoveWorkflowHandler(
	projectRepo repository.ProjectRepository,
) RemoveWorkflowHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return RemoveWorkflowHandler{
		projectRepo: projectRepo,
	}
}

func (h RemoveWorkflowHandler) Handle(ctx context.Context, cmd RemoveWorkflowCommand) error {
	return h.projectRepo.DeleteWorkflow(ctx, cmd.WorkflowID)
}
