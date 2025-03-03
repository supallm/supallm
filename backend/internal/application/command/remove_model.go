package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
	"github.com/supallm/core/internal/pkg/slug"
)

type RemoveModelCommand struct {
	ProjectID uuid.UUID
	Slug      slug.Slug
}

type RemoveModelHandler struct {
	projectRepo repository.ProjectRepository
}

func NewRemoveModelHandler(
	projectRepo repository.ProjectRepository,
) RemoveModelHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return RemoveModelHandler{
		projectRepo: projectRepo,
	}
}

func (h RemoveModelHandler) Handle(ctx context.Context, cmd RemoveModelCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.ErrNotFound{Resource: "project", ID: cmd.ProjectID}
	}

	err = project.RemoveModel(cmd.Slug)
	if err != nil {
		return errs.ErrReqInvalid{Reason: err.Error()}
	}
	return h.projectRepo.Update(ctx, project)
}
