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
	sessionRepo repository.SessionRepository
	llmProvider repository.LLMProvider
}

func NewStreamTextHandler(
	projectRepo repository.ProjectRepository,
	sessionRepo repository.SessionRepository,
	llmProvider repository.LLMProvider,
) StreamTextHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	if sessionRepo == nil {
		slog.Error("sessionRepo is nil")
		os.Exit(1)
	}

	if llmProvider == nil {
		slog.Error("llmProvider is nil")
		os.Exit(1)
	}

	return StreamTextHandler{
		projectRepo: projectRepo,
		sessionRepo: sessionRepo,
		llmProvider: llmProvider,
	}
}

func (h StreamTextHandler) Handle(_ context.Context, _ StreamTextCommand) (string, error) {
	return "", nil
}
