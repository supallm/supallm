package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/repository"
)

type RemoveModelCommand struct {
	ModelID uuid.UUID
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
	return h.projectRepo.DeleteModel(ctx, cmd.ModelID)
}
