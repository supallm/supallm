package command

import (
	"context"
	"errors"
	"log/slog"
	"os"

	"github.com/google/uuid"
	repo "github.com/supallm/core/internal/adapters/errors"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
	"github.com/supallm/core/internal/pkg/secret"
)

type AddCredentialCommand struct {
	ID           uuid.UUID
	ProjectID    uuid.UUID
	Name         string
	ProviderType model.ProviderType
	APIKey       secret.APIKey
}

type AddCredentialHandler struct {
	projectRepo repository.ProjectRepository
}

func NewAddCredentialHandler(
	projectRepo repository.ProjectRepository,
) AddCredentialHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return AddCredentialHandler{
		projectRepo: projectRepo,
	}
}

func (h AddCredentialHandler) Handle(ctx context.Context, cmd AddCredentialCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		if errors.Is(err, repo.ErrNotFound) {
			return errs.NotFoundError{Resource: "project", ID: cmd.ProjectID}
		}
		return errs.InternalError{Err: err}
	}

	credential, err := project.CreateCredential(cmd.ID, cmd.Name, cmd.ProviderType, cmd.APIKey)
	if err != nil {
		return errs.InvalidError{Reason: "unable to add credential", Err: err}
	}

	err = h.projectRepo.AddCredential(ctx, project.ID, credential)
	if err != nil {
		if errors.Is(err, repo.ErrDuplicate) {
			return errs.DuplicateError{Resource: "credential", ID: cmd.ID, Err: err}
		}
		return errs.InternalError{Err: err}
	}

	return nil
}
