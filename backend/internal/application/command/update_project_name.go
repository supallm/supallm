package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
)

type UpdateProjectNameCommand struct {
	ID        uuid.UUID
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
		return errs.ErrInternal{Reason: err}
	}

	err = project.UpdateName(cmd.Name)
	if err != nil {
		return err
	}

	return h.projectRepo.Update(ctx, project)
}
