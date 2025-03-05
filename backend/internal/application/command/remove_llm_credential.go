package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/repository"
)

type RemoveLLMCredentialCommand struct {
	LLMCredentialID uuid.UUID
}

type RemoveLLMCredentialHandler struct {
	projectRepo repository.ProjectRepository
}

func NewRemoveLLMCredentialHandler(
	projectRepo repository.ProjectRepository,
) RemoveLLMCredentialHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return RemoveLLMCredentialHandler{
		projectRepo: projectRepo,
	}
}

func (h RemoveLLMCredentialHandler) Handle(ctx context.Context, cmd RemoveLLMCredentialCommand) error {
	return h.projectRepo.DeleteLLMCredential(ctx, cmd.LLMCredentialID)
}
