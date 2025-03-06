package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/repository"
)

type RemoveCredentialCommand struct {
	LLMCredentialID uuid.UUID
}

type RemoveCredentialHandler struct {
	projectRepo repository.ProjectRepository
}

func NewRemoveCredentialHandler(
	projectRepo repository.ProjectRepository,
) RemoveCredentialHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return RemoveCredentialHandler{
		projectRepo: projectRepo,
	}
}

func (h RemoveCredentialHandler) Handle(ctx context.Context, cmd RemoveCredentialCommand) error {
	return h.projectRepo.DeleteCredential(ctx, cmd.LLMCredentialID)
}
