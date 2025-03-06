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

type UpdateAuthProviderCommand struct {
	ProjectID    uuid.UUID
	ProviderType model.AuthProviderType
	Config       map[string]any
}

type UpdateAuthProviderHandler struct {
	projectRepo repository.ProjectRepository
}

func NewUpdateAuthProviderHandler(
	projectRepo repository.ProjectRepository,
) UpdateAuthProviderHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return UpdateAuthProviderHandler{
		projectRepo: projectRepo,
	}
}

func (h UpdateAuthProviderHandler) Handle(ctx context.Context, cmd UpdateAuthProviderCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.NotFoundError{Resource: "project", ID: cmd.ProjectID}
	}

	err = project.NewAuthProvider(cmd.ProviderType, cmd.Config)
	if err != nil {
		return errs.InvalidError{Reason: err.Error()}
	}

	return h.projectRepo.Update(ctx, project)
}
