package query

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
)

type ListAPIKeysQuery struct {
	ProjectID uuid.UUID
}

type ListAPIKeysHandler struct {
	projectReader ProjectReader
}

func NewListAPIKeysHandler(projectReader ProjectReader) ListAPIKeysHandler {
	if projectReader == nil {
		slog.Error("projectReader is nil")
		os.Exit(1)
	}

	return ListAPIKeysHandler{
		projectReader: projectReader,
	}
}

func (h ListAPIKeysHandler) Handle(ctx context.Context, query ListAPIKeysQuery) ([]APIKey, error) {
	project, err := h.projectReader.ReadProject(ctx, query.ProjectID)
	if err != nil {
		return nil, err
	}

	return project.APIKeys, nil
}
