package command

import (
	"context"
	"encoding/json"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
)

type AddWorkflowCommand struct {
	ProjectID   uuid.UUID
	WorkflowID  uuid.UUID
	Name        string
	BuilderFlow json.RawMessage
}

type AddWorkflowHandler struct {
	projectRepo repository.ProjectRepository
}

func NewAddWorkflowHandler(
	projectRepo repository.ProjectRepository,
) AddWorkflowHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return AddWorkflowHandler{
		projectRepo: projectRepo,
	}
}

func (h AddWorkflowHandler) Handle(ctx context.Context, cmd AddWorkflowCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.NotFoundError{Resource: "project", ID: cmd.ProjectID}
	}

	err = project.AddWorkflow(
		cmd.WorkflowID,
		cmd.Name,
		cmd.BuilderFlow,
	)
	if err != nil {
		return errs.InvalidError{Reason: err.Error()}
	}
	return h.projectRepo.Update(ctx, project)
}
