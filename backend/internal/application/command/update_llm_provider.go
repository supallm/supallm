package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
	"github.com/supallm/core/internal/pkg/secret"
)

type UpdateLLMProviderCommand struct {
	ID        uuid.UUID
	ProjectID uuid.UUID
	Name      string
	APIKey    secret.ApiKey
}

type UpdateLLMProviderHandler struct {
	projectRepo repository.ProjectRepository
}

func NewUpdateLLMProviderHandler(
	projectRepo repository.ProjectRepository,
) UpdateLLMProviderHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return UpdateLLMProviderHandler{
		projectRepo: projectRepo,
	}
}

func (h UpdateLLMProviderHandler) Handle(ctx context.Context, cmd UpdateLLMProviderCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.ErrNotFound{Resource: "project", ID: cmd.ProjectID}
	}

	err = project.UpdateProvider(cmd.ID, cmd.Name, cmd.APIKey)
	if err != nil {
		return errs.ErrReqInvalid{Reason: err.Error()}
	}
	return h.projectRepo.Update(ctx, project)
}
