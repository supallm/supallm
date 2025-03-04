package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/repository"
)

type RemoveLLMProviderCommand struct {
	LLMProviderID uuid.UUID
}

type RemoveLLMProviderHandler struct {
	projectRepo repository.ProjectRepository
}

func NewRemoveLLMProviderHandler(
	projectRepo repository.ProjectRepository,
) RemoveLLMProviderHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return RemoveLLMProviderHandler{
		projectRepo: projectRepo,
	}
}

func (h RemoveLLMProviderHandler) Handle(ctx context.Context, cmd RemoveLLMProviderCommand) error {
	return h.projectRepo.DeleteLLMProvider(ctx, cmd.LLMProviderID)
}
