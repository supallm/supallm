package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
	"github.com/supallm/core/internal/pkg/secret"
)

type QueueWorkflowCommand struct {
	ID           uuid.UUID
	ProjectID    uuid.UUID
	Name         string
	ProviderType model.ProviderType
	APIKey       secret.APIKey
}

type QueueWorkflowHandler struct {
	projectRepo   repository.ProjectRepository
	runnerService RunnerService
}

func NewQueueWorkflowHandler(
	projectRepo repository.ProjectRepository,
	runnerService RunnerService,
) QueueWorkflowHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	if runnerService == nil {
		slog.Error("runnerService is nil")
		os.Exit(1)
	}

	return QueueWorkflowHandler{
		projectRepo:   projectRepo,
		runnerService: runnerService,
	}
}

func (h QueueWorkflowHandler) Handle(ctx context.Context, cmd QueueWorkflowCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.NotFoundError{Resource: "project", ID: cmd.ProjectID}
	}

	workflow, err := project.GetWorkflow(cmd.ID)
	if err != nil {
		return errs.NotFoundError{Resource: "workflow", ID: cmd.ID}
	}

	err = h.runnerService.QueueWorkflow(ctx, workflow)
	if err != nil {
		return errs.InvalidError{Reason: err.Error()}
	}

	return nil
}
