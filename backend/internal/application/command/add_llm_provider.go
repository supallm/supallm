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

type AddLLMProviderCommand struct {
	ID           uuid.UUID
	ProjectID    uuid.UUID
	Name         string
	ProviderType model.LLMProviderType
	APIKey       secret.ApiKey
}

type AddLLMProviderHandler struct {
	projectRepo      repository.ProjectRepository
	providerRegistry repository.ProviderRegistry
}

func NewAddLLMProviderHandler(
	projectRepo repository.ProjectRepository,
	providerRegistry repository.ProviderRegistry,
) AddLLMProviderHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	if providerRegistry == nil {
		slog.Error("providerRegistry is nil")
		os.Exit(1)
	}

	return AddLLMProviderHandler{
		projectRepo:      projectRepo,
		providerRegistry: providerRegistry,
	}
}

func (h AddLLMProviderHandler) Handle(ctx context.Context, cmd AddLLMProviderCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.ErrNotFound{Resource: "project", ID: cmd.ProjectID}
	}

	provider, err := project.CreateProvider(cmd.ID, cmd.Name, cmd.ProviderType, cmd.APIKey)
	if err != nil {
		return errs.ErrReqInvalid{Reason: err.Error()}
	}

	llmProvider, err := h.providerRegistry.GetLLM(provider)
	if err != nil {
		return errs.ErrReqInvalid{Reason: err.Error()}
	}

	err = llmProvider.VerifyKey(ctx, cmd.APIKey)
	if err != nil {
		return errs.ErrReqInvalid{Reason: err.Error()}
	}

	return h.projectRepo.Update(ctx, project)
}
