package command

import (
	"context"
	"errors"
	"log/slog"
	"os"

	"github.com/google/uuid"
	repo "github.com/supallm/core/internal/adapters/project"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
	"github.com/supallm/core/internal/pkg/secret"
)

type UpdateCredentialCommand struct {
	ID        uuid.UUID
	ProjectID uuid.UUID
	Name      string
	APIKey    secret.APIKey
}

type UpdateCredentialHandler struct {
	projectRepo repository.ProjectRepository
}

func NewUpdateCredentialHandler(
	projectRepo repository.ProjectRepository,
) UpdateCredentialHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return UpdateCredentialHandler{
		projectRepo: projectRepo,
	}
}

func (h UpdateCredentialHandler) Handle(ctx context.Context, cmd UpdateCredentialCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		if errors.Is(err, repo.ErrProjectNotFound) {
			return errs.NotFoundError{Resource: "project", ID: cmd.ProjectID}
		}
		return errs.InternalError{Err: err}
	}

	err = project.UpdateCredential(cmd.ID, cmd.Name, cmd.APIKey)
	if err != nil {
		return errs.InvalidError{Reason: err.Error()}
	}

	err = h.projectRepo.Update(ctx, project)
	if err != nil {
		return errs.UpdateError{Entity: "project", Err: err}
	}

	return nil
}
