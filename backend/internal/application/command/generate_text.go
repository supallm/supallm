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

type GenerateTextHandler struct {
	projectRepo repository.ProjectRepository
	sessionRepo repository.LLMSessionRepository
	llmService  LLMService
}

func NewGenerateTextHandler(
	projectRepo repository.ProjectRepository,
	sessionRepo repository.LLMSessionRepository,
	llmService LLMService,
) GenerateTextHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	if sessionRepo == nil {
		slog.Error("sessionRepo is nil")
		os.Exit(1)
	}

	if llmService == nil {
		slog.Error("llmService is nil")
		os.Exit(1)
	}

	return GenerateTextHandler{
		projectRepo: projectRepo,
		sessionRepo: sessionRepo,
		llmService:  llmService,
	}
}

func (h *GenerateTextHandler) Handle(ctx context.Context, cmd GenerateTextCommand) (string, error) {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return "", errs.ErrNotFound{Resource: "project", ID: cmd.ProjectID}
	}

	session, err := h.retrieveSession(ctx, project, cmd.SessionID, cmd.UserID)
	if err != nil {
		return "", err
	}

	llmModel, err := project.GetModel(cmd.Model)
	if err != nil {
		return "", errs.ErrNotFound{Resource: "model", ID: cmd.Model}
	}

	request, err := session.NewRequest(cmd.SessionID, llmModel, model.LLMRequestConfig{
		Prompt:      cmd.Prompt,
		MaxTokens:   cmd.MaxTokens,
		Temperature: cmd.Temperature,
	})
	if err != nil {
		return "", errs.ErrNotFound{Resource: "model", ID: cmd.Model}
	}

	response, err := h.llmService.GenerateText(ctx, request)
	if err != nil {
		return "", errs.ErrInternal{Reason: err}
	}

	session.AddResponse(response)
	err = h.sessionRepo.Update(ctx, session)
	if err != nil {
		return "", errs.ErrInternal{Reason: err}
	}
	return response.Content, nil
}

func (h *GenerateTextHandler) retrieveSession(ctx context.Context, project *model.Project, sessionID uuid.UUID, userID uuid.UUID) (*model.LLMSession, error) {
	session, err := h.sessionRepo.Retrieve(ctx, sessionID)
	if err != nil {
		if !errors.Is(err, nil) {
			return nil, errs.ErrInternal{Reason: err}
		}

		session = model.NewLLMSession(sessionID, userID, project.ID)
		return session, nil
	}

	return session, nil
}
