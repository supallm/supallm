package command

import (
	"context"
	"errors"
	"log/slog"
	"os"

	"github.com/google/uuid"
	repo "github.com/supallm/core/internal/adapters/errors"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
)

type UpdateProjectNameCommand struct {
	ProjectID uuid.UUID
	Name      string
}

type UpdateProjectNameHandler struct {
	projectRepo repository.ProjectRepository
}

func NewUpdateProjectNameHandler(
	projectRepo repository.ProjectRepository,
) UpdateProjectNameHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return UpdateProjectNameHandler{
		projectRepo: projectRepo,
	}
}

func (h UpdateProjectNameHandler) Handle(ctx context.Context, cmd UpdateProjectNameCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.InternalError{Err: err}
	}

	err = project.UpdateName(cmd.Name)
	if err != nil {
		return err
	}

	err = h.projectRepo.Update(ctx, project)
	if err != nil {
		if errors.Is(err, repo.ErrNotFound) {
			return errs.NotFoundError{Resource: "project", ID: cmd.ProjectID, Err: err}
		}
		if errors.Is(err, repo.ErrDuplicate) {
			return errs.DuplicateError{Resource: "project", ID: cmd.ProjectID, Err: err}
		}
		return errs.InternalError{Err: err}
	}

	return nil
}
