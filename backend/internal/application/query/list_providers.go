package query

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
)

type ListProvidersQuery struct {
	ProjectID uuid.UUID
}

type ListProvidersHandler struct {
	projectReader ProjectReader
}

func NewListProvidersHandler(projectReader ProjectReader) ListProvidersHandler {
	if projectReader == nil {
		slog.Error("projectReader is nil")
		os.Exit(1)
	}

	return ListProvidersHandler{
		projectReader: projectReader,
	}
}

func (h ListProvidersHandler) Handle(ctx context.Context, query ListProvidersQuery) ([]LLMProvider, error) {
	project, err := h.projectReader.GetProject(ctx, query.ProjectID)
	if err != nil {
		return nil, err
	}

	return project.LLMProviders, nil
}
