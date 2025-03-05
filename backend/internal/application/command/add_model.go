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

type AddModelCommand struct {
	ProjectID       uuid.UUID
	ModelID         uuid.UUID
	Slug            slug.Slug
	Name            string
	LLMCredentialID uuid.UUID
	LLMModel        model.LLMModel
	SystemPrompt    model.Prompt
	Parameters      model.ModelParameters
}

type AddModelHandler struct {
	projectRepo repository.ProjectRepository
}

func NewAddModelHandler(
	projectRepo repository.ProjectRepository,
) AddModelHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	return AddModelHandler{
		projectRepo: projectRepo,
	}
}

func (h AddModelHandler) Handle(ctx context.Context, cmd AddModelCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.ErrNotFound{Resource: "project", ID: cmd.ProjectID}
	}

	err = project.AddModel(cmd.ModelID, cmd.Name, cmd.Slug, cmd.LLMCredentialID, cmd.LLMModel, cmd.SystemPrompt, cmd.Parameters)
	if err != nil {
		return errs.ErrReqInvalid{Reason: err.Error()}
	}
	return h.projectRepo.Update(ctx, project)
}
