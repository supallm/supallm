package command

import (
	"context"
	"errors"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
	"github.com/supallm/core/internal/pkg/slug"
)

type GenerateTextCommand struct {
	SessionID   uuid.UUID
	ProjectID   uuid.UUID
	UserID      string
	Prompt      model.Prompt
	ModelSlug   slug.Slug
	MaxTokens   int
	Temperature float64
}

type GenerateTextHandler struct {
	projectRepo repository.ProjectRepository
	sessionRepo repository.LLMSessionRepository
	llmProvider repository.LLMProvider
}

func NewGenerateTextHandler(
	projectRepo repository.ProjectRepository,
	sessionRepo repository.LLMSessionRepository,
	llmProvider repository.LLMProvider,
) GenerateTextHandler {
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

	return GenerateTextHandler{
		projectRepo: projectRepo,
		sessionRepo: sessionRepo,
		llmProvider: llmProvider,
	}
}

func (h GenerateTextHandler) Handle(ctx context.Context, cmd GenerateTextCommand) (string, error) {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return "", errs.ErrNotFound{Resource: "project", ID: cmd.ProjectID}
	}

	session, err := h.getOrCreateSession(ctx, cmd.ProjectID, cmd.SessionID, cmd.UserID)
	if err != nil {
		return "", err
	}

	m, err := project.GetModel(cmd.ModelSlug)
	if err != nil {
		return "", errs.ErrNotFound{Resource: "model", ID: cmd.ModelSlug}
	}

	request, err := session.NewRequest(cmd.SessionID, m, model.LLMRequestConfig{
		Prompt: cmd.Prompt,
	})
	if err != nil {
		return "", errs.ErrNotFound{Resource: "model", ID: cmd.ModelSlug}
	}

	response, err := h.llmProvider.GenerateText(ctx, request)
	if err != nil {
		return "", errs.ErrInternal{Reason: err}
	}

	err = h.saveResponse(ctx, session, response)
	if err != nil {
		return "", errs.ErrInternal{Reason: err}
	}

	return response.Content, nil
}

func (h GenerateTextHandler) getOrCreateSession(ctx context.Context, projectID, sessionID uuid.UUID, userID string) (*model.LLMSession, error) {
	session, err := h.sessionRepo.Retrieve(ctx, sessionID)
	if err != nil {
		if !errors.Is(err, nil) {
			return nil, errs.ErrInternal{Reason: err}
		}

		session = model.NewLLMSession(sessionID, userID, projectID)
		return session, nil
	}

	return session, nil
}

func (s GenerateTextHandler) saveResponse(ctx context.Context, session *model.LLMSession, response *model.LLMResponse) error {
	session.AddResponse(response)
	return s.sessionRepo.Update(ctx, session)
}
