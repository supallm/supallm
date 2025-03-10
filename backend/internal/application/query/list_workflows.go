package query

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
)

type ListWorkflowsQuery struct {
	ProjectID uuid.UUID
}

type ListWorkflowsHandler struct {
	projectReader ProjectReader
}

func NewListWorkflowsHandler(projectReader ProjectReader) ListWorkflowsHandler {
	if projectReader == nil {
		slog.Error("projectReader is nil")
		os.Exit(1)
	}

	return ListWorkflowsHandler{
		projectReader: projectReader,
	}
}

func (h ListWorkflowsHandler) Handle(ctx context.Context, query ListWorkflowsQuery) ([]Workflow, error) {
	project, err := h.projectReader.ReadProject(ctx, query.ProjectID)
	if err != nil {
		return nil, err
	}

	return project.Workflows, nil
}
