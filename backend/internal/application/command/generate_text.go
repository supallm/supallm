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
	UserID      uuid.UUID
	Prompt      model.Prompt
	Model       slug.Slug
	MaxTokens   int
	Temperature float64
}

func (cmd GenerateTextCommand) ToRequestConfig() model.LLMRequestConfig {
	return model.LLMRequestConfig{
		Prompt:      cmd.Prompt,
		MaxTokens:   cmd.MaxTokens,
		Temperature: cmd.Temperature,
	}
}

type GenerateTextHandler struct {
	projectRepo repository.ProjectRepository
	sessionRepo repository.LLMSessionRepository
	llmRegistry repository.ProviderRegistry
}

func NewGenerateTextHandler(
	projectRepo repository.ProjectRepository,
	sessionRepo repository.LLMSessionRepository,
	llmRegistry repository.ProviderRegistry,
) GenerateTextHandler {
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

	return GenerateTextHandler{
		projectRepo: projectRepo,
		sessionRepo: sessionRepo,
		llmRegistry: llmRegistry,
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

	llmModel, provider, err := project.GetModelAndProvider(cmd.Model)
	if err != nil {
		return "", errs.ErrNotFound{Resource: "model", ID: cmd.Model}
	}

	request, err := session.NewRequest(cmd.SessionID, llmModel, cmd.ToRequestConfig())
	if err != nil {
		return "", errs.ErrNotFound{Resource: "model", ID: cmd.Model}
	}

	response, err := h.generateText(ctx, request, provider)
	if err != nil {
		return "", err
	}

	err = h.saveResponse(ctx, session, response)
	if err != nil {
		return "", errs.ErrInternal{Reason: err}
	}

	return response.Content, nil
}

func (h GenerateTextHandler) getOrCreateSession(ctx context.Context, projectID, sessionID, userID uuid.UUID) (*model.LLMSession, error) {
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

func (s GenerateTextHandler) generateText(ctx context.Context, request *model.LLMRequest, provider *model.LLMProvider) (*model.LLMResponse, error) {
	llm, err := s.llmRegistry.GetLLM(provider)
	if err != nil {
		return nil, errs.ErrInternal{Reason: err}
	}

	response, err := llm.GenerateText(ctx, request)
	if err != nil {
		return nil, errs.ErrInternal{Reason: err}
	}

	return response, nil
}

func (s GenerateTextHandler) saveResponse(ctx context.Context, session *model.LLMSession, response *model.LLMResponse) error {
	session.AddResponse(response)
	return s.sessionRepo.Update(ctx, session)
}
