package query

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/slug"
)

type GetModelQuery struct {
	ProjectID uuid.UUID
	ModelSlug slug.Slug
}

type GetModelHandler struct {
	projectReader ProjectReader
}

func NewGetModelHandler(projectReader ProjectReader) GetModelHandler {
	if projectReader == nil {
		slog.Error("projectReader is nil")
		os.Exit(1)
	}

	return GetModelHandler{
		projectReader: projectReader,
	}
}

func (h GetModelHandler) Handle(ctx context.Context, query GetModelQuery) (Model, error) {
	model, err := h.projectReader.ReadModel(ctx, query.ProjectID, query.ModelSlug)
	if err != nil {
		return Model{}, err
	}

	return model, nil
}
