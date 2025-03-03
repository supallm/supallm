package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
	"github.com/supallm/core/internal/pkg/slug"
)

type UpdateModelCommand struct {
	ProjectID     uuid.UUID
	Slug          slug.Slug
	LLMProviderID uuid.UUID
	LLMModel      model.LLMModel
	SystemPrompt  model.Prompt
}

type UpdateModelHandler struct {
	projectRepo repository.ProjectRepository
}

func NewUpdateModelHandler(
	projectRepo repository.ProjectRepository,
) UpdateModelHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return UpdateModelHandler{
		projectRepo: projectRepo,
	}
}

func (h UpdateModelHandler) Handle(ctx context.Context, cmd UpdateModelCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.ErrNotFound{Resource: "project", ID: cmd.ProjectID}
	}

	err = project.UpdateModel(cmd.Slug, cmd.LLMProviderID, cmd.LLMModel, cmd.SystemPrompt)
	if err != nil {
		return errs.ErrReqInvalid{Reason: err.Error()}
	}
	return h.projectRepo.Update(ctx, project)
}
