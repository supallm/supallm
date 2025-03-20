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
	"github.com/supallm/core/internal/pkg/auth"
	"github.com/supallm/core/internal/pkg/config"
	"github.com/supallm/core/internal/pkg/errs"
)

type LoadFixtureCommand struct{}

type LoadFixtureHandler struct {
	projectRepo repository.ProjectRepository
	userRepo    repository.UserRepository
	defaultUser config.Auth
}

func NewLoadFixtureHandler(
	projectRepo repository.ProjectRepository,
	userRepo repository.UserRepository,
	defaultUser config.Auth,
) LoadFixtureHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}
	if userRepo == nil {
		slog.Error("userRepo is nil")
		os.Exit(1)
	}

	return LoadFixtureHandler{
		projectRepo: projectRepo,
		userRepo:    userRepo,
		defaultUser: defaultUser,
	}
}

func (h LoadFixtureHandler) Handle(ctx context.Context, cmd LoadFixtureCommand) error {
	_, err := h.userRepo.GetUserByEmail(ctx, h.defaultUser.InitialUser.Email)
	if err == nil {
		slog.Info("user already exists, skipping fixture load")
		return nil
	}
	if !errors.Is(err, repo.ErrNotFound) {
		return errs.InternalError{Err: err}
	}

	hash, err := auth.HashPassword(h.defaultUser.InitialUser.Password)
	if err != nil {
		return errs.InternalError{Err: err}
	}

	user := &model.User{
		ID:           uuid.New(),
		Email:        h.defaultUser.InitialUser.Email,
		Name:         h.defaultUser.InitialUser.Name,
		PasswordHash: hash,
	}

	err = h.userRepo.CreateUser(ctx, user)
	if err != nil {
		return errs.InternalError{Err: err}
	}

	project, err := model.NewProject(uuid.New(), user.ID.String(), "default")
	if err != nil {
		return errs.InternalError{Err: err}
	}

	err = h.projectRepo.Create(ctx, project)
	if err != nil {
		return errs.InternalError{Err: err}
	}

	return nil
}
