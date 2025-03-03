package query

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
)

type ListModelsQuery struct {
	ProjectID uuid.UUID
}

type ListModelsHandler struct {
	projectReader ProjectReader
}

func NewListModelsHandler(projectReader ProjectReader) ListModelsHandler {
	if projectReader == nil {
		slog.Error("projectReader is nil")
		os.Exit(1)
	}

	return ListModelsHandler{
		projectReader: projectReader,
	}
}

func (h ListModelsHandler) Handle(ctx context.Context, query ListModelsQuery) ([]Model, error) {
	project, err := h.projectReader.GetProject(ctx, query.ProjectID)
	if err != nil {
		return nil, err
	}

	return project.Models, nil
}
