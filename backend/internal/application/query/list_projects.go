package query

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
)

type ListProjectsQuery struct {
	UserID uuid.UUID
}

type ListProjectsHandler struct {
	projectReader ProjectReader
}

func NewListProjectsHandler(projectReader ProjectReader) ListProjectsHandler {
	if projectReader == nil {
		slog.Error("projectReader is nil")
		os.Exit(1)
	}

	return ListProjectsHandler{
		projectReader: projectReader,
	}
}

func (h ListProjectsHandler) Handle(ctx context.Context, query ListProjectsQuery) ([]Project, error) {
	projects, err := h.projectReader.ListProjects(ctx, query.UserID)
	if err != nil {
		return nil, err
	}

	return projects, nil
}
