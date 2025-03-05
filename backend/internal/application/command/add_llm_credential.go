package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
	"github.com/supallm/core/internal/pkg/secret"
)

type AddLLMCredentialCommand struct {
	ID           uuid.UUID
	ProjectID    uuid.UUID
	Name         string
	ProviderType model.LLMProviderType
	APIKey       secret.ApiKey
}

type AddLLMCredentialHandler struct {
	projectRepo repository.ProjectRepository
	llmProvider repository.LLMProvider
}

func NewAddLLMCredentialHandler(
	projectRepo repository.ProjectRepository,
	llmProvider repository.LLMProvider,
) AddLLMCredentialHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	if llmProvider == nil {
		slog.Error("llmProvider is nil")
		os.Exit(1)
	}

	return AddLLMCredentialHandler{
		projectRepo: projectRepo,
		llmProvider: llmProvider,
	}
}

func (h AddLLMCredentialHandler) Handle(ctx context.Context, cmd AddLLMCredentialCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.ErrNotFound{Resource: "project", ID: cmd.ProjectID}
	}

	credential, err := project.CreateCredential(cmd.ID, cmd.Name, cmd.ProviderType, cmd.APIKey)
	if err != nil {
		return errs.ErrReqInvalid{Reason: err.Error()}
	}

	err = h.llmProvider.VerifyKey(ctx, credential)
	if err != nil {
		return errs.ErrReqInvalid{Reason: err.Error()}
	}

	return h.projectRepo.Update(ctx, project)
}
