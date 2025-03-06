package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
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
		return errs.ReqInvalidError{Reason: err.Error()}
	}

	return h.projectRepo.Create(ctx, project)
}
