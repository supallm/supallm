package command

import (
	"context"
	"errors"
	"log/slog"
	"os"

	"github.com/google/uuid"
	repo "github.com/supallm/core/internal/adapters/errors"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
)

type CreateProjectCommand struct {
	ID     uuid.UUID
	UserID string
	Name   string
}

type CreateProjectHandler struct {
	projectRepo repository.ProjectRepository
}

func NewCreateProjectHandler(
	projectRepo repository.ProjectRepository,
) CreateProjectHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return CreateProjectHandler{
		projectRepo: projectRepo,
	}
}

func (h CreateProjectHandler) Handle(ctx context.Context, cmd CreateProjectCommand) error {
	project, err := model.NewProject(cmd.ID, cmd.UserID, cmd.Name)
	if err != nil {
		return errs.InvalidError{Reason: err.Error()}
	}

	err = h.projectRepo.Create(ctx, project)
	if err != nil {
		if errors.Is(err, repo.ErrDuplicate) {
			return errs.DuplicateError{Resource: "project", ID: cmd.ID, Err: err}
		}
		return errs.InternalError{Err: err}
	}

	return nil
}
