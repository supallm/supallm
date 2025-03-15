package command

import (
	"context"
	"errors"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
	"github.com/supallm/core/internal/pkg/secret"
)

type AuthorizeEventSubscriptionCommand struct {
	ProjectID uuid.UUID
	SecretKey secret.APIKey
}

type AuthorizeEventSubscriptionHandler struct {
	projectRepo repository.ProjectRepository
}

func NewAuthorizeEventSubscriptionHandler(
	projectRepo repository.ProjectRepository,
) AuthorizeEventSubscriptionHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return AuthorizeEventSubscriptionHandler{
		projectRepo: projectRepo,
	}
}

func (h AuthorizeEventSubscriptionHandler) Handle(ctx context.Context, cmd AuthorizeEventSubscriptionCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.NotFoundError{Resource: "project", ID: cmd.ProjectID, Err: err}
	}

	if !project.ValidateAPIKey(cmd.SecretKey) {
		return errs.UnauthorizedError{Err: errors.New("invalid secret key")}
	}

	return nil
}
