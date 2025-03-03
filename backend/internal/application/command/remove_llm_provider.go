package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
)

type RemoveLLMProviderCommand struct {
	ID        uuid.UUID
	ProjectID uuid.UUID
}

type RemoveLLMProviderHandler struct {
	projectRepo repository.ProjectRepository
}

func NewRemoveLLMProviderHandler(
	projectRepo repository.ProjectRepository,
) RemoveLLMProviderHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return RemoveLLMProviderHandler{
		projectRepo: projectRepo,
	}
}

func (h RemoveLLMProviderHandler) Handle(ctx context.Context, cmd RemoveLLMProviderCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.ErrNotFound{Resource: "project", ID: cmd.ProjectID}
	}

	err = project.RemoveProvider(cmd.ID)
	if err != nil {
		return errs.ErrReqInvalid{Reason: err.Error()}
	}
	return h.projectRepo.Update(ctx, project)
}
