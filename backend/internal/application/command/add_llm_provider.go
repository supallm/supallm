package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
)

type AddLLMProviderCommand struct {
	ID           uuid.UUID
	ProjectID    uuid.UUID
	Name         string
	ProviderType model.LLMProviderType
	APIKey       string
}

type AddLLMProviderHandler struct {
	projectRepo repository.ProjectRepository
}

func NewAddLLMProviderHandler(
	projectRepo repository.ProjectRepository,
) AddLLMProviderHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return AddLLMProviderHandler{
		projectRepo: projectRepo,
	}
}

func (h AddLLMProviderHandler) Handle(ctx context.Context, cmd AddLLMProviderCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.ErrNotFound{Resource: "project", ID: cmd.ProjectID}
	}

	err = project.AddProvider(cmd.ID, cmd.Name, cmd.ProviderType, cmd.APIKey)
	if err != nil {
		return errs.ErrReqInvalid{Reason: err.Error()}
	}
	return h.projectRepo.Update(ctx, project)
}
