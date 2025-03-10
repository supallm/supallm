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

type UpdateWorkflowCommand struct {
	ProjectID   uuid.UUID
	WorkflowID  uuid.UUID
	Name        string
	BuilderFlow json.RawMessage
}

type UpdateWorkflowHandler struct {
	projectRepo repository.ProjectRepository
}

func NewUpdateWorkflowHandler(
	projectRepo repository.ProjectRepository,
) UpdateWorkflowHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return UpdateWorkflowHandler{
		projectRepo: projectRepo,
	}
}

func (h UpdateWorkflowHandler) Handle(ctx context.Context, cmd UpdateWorkflowCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.NotFoundError{Resource: "project", ID: cmd.ProjectID}
	}

	err = project.UpdateWorkflowName(cmd.WorkflowID, cmd.Name)
	if err != nil {
		return errs.InvalidError{Reason: err.Error()}
	}

	err = project.UpdateWorkflowBuilderFlow(cmd.WorkflowID, cmd.BuilderFlow)
	if err != nil {
		return errs.InvalidError{Reason: err.Error()}
	}

	return h.projectRepo.Update(ctx, project)
}
