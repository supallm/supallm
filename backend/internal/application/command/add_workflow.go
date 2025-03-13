package command

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"os"

	"github.com/google/uuid"
	repo "github.com/supallm/core/internal/adapters/errors"
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
	p, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.NotFoundError{Resource: "project", ID: cmd.ProjectID}
	}

	err = p.AddWorkflow(
		cmd.WorkflowID,
		cmd.Name,
		cmd.BuilderFlow,
	)
	if err != nil {
		return errs.InvalidError{Reason: err.Error()}
	}
	err = h.projectRepo.Update(ctx, p)
	if err != nil {
		if errors.Is(err, repo.ErrNotFound) {
			return errs.NotFoundError{Resource: "project", ID: cmd.ProjectID}
		}
		if errors.Is(err, repo.ErrDuplicate) {
			return errs.DuplicateError{Resource: "workflow", ID: cmd.WorkflowID}
		}
		return errs.InternalError{Err: err}
	}
	return nil
}
