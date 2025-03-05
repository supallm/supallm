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

type UpdateLLMCredentialCommand struct {
	ID        uuid.UUID
	ProjectID uuid.UUID
	Name      string
	APIKey    secret.ApiKey
}

type UpdateLLMCredentialHandler struct {
	projectRepo repository.ProjectRepository
}

func NewUpdateLLMCredentialHandler(
	projectRepo repository.ProjectRepository,
) UpdateLLMCredentialHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return UpdateLLMCredentialHandler{
		projectRepo: projectRepo,
	}
}

func (h UpdateLLMCredentialHandler) Handle(ctx context.Context, cmd UpdateLLMCredentialCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.ErrNotFound{Resource: "project", ID: cmd.ProjectID}
	}

	err = project.UpdateCredential(cmd.ID, cmd.Name, cmd.APIKey)
	if err != nil {
		return errs.ErrReqInvalid{Reason: err.Error()}
	}
	return h.projectRepo.Update(ctx, project)
}
