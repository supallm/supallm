package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/slug"
)

type StreamTextCommand struct {
	SessionID   uuid.UUID
	UserID      uuid.UUID
	ProjectID   uuid.UUID
	Prompt      model.Prompt
	Model       slug.Slug
	MaxTokens   int
	Temperature float64
}

type StreamTextHandler struct {
	projectRepo repository.ProjectRepository
	sessionRepo repository.LLMSessionRepository
	llmRegistry repository.ProviderRegistry
}

func NewStreamTextHandler(
	projectRepo repository.ProjectRepository,
	sessionRepo repository.LLMSessionRepository,
	llmRegistry repository.ProviderRegistry,
) StreamTextHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	if sessionRepo == nil {
		slog.Error("sessionRepo is nil")
		os.Exit(1)
	}

	if llmRegistry == nil {
		slog.Error("llmRegistry is nil")
		os.Exit(1)
	}

	return StreamTextHandler{
		projectRepo: projectRepo,
		sessionRepo: sessionRepo,
		llmRegistry: llmRegistry,
	}
}

func (h StreamTextHandler) Handle(ctx context.Context, cmd StreamTextCommand) (string, error) {
	return "", nil
}
