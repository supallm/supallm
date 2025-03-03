package query

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
)

type GetProjectQuery struct {
	ProjectID uuid.UUID
}

type GetProjectHandler struct {
	projectReader ProjectReader
}

func NewGetProjectHandler(projectReader ProjectReader) GetProjectHandler {
	if projectReader == nil {
		slog.Error("projectReader is nil")
		os.Exit(1)
	}

	return GetProjectHandler{
		projectReader: projectReader,
	}
}

func (h GetProjectHandler) Handle(ctx context.Context, query GetProjectQuery) (Project, error) {
	project, err := h.projectReader.GetProject(ctx, query.ProjectID)
	if err != nil {
		return Project{}, err
	}

	return project, nil
}
