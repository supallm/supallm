package query

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
)

type GetWorkflowQuery struct {
	ProjectID  uuid.UUID
	WorkflowID uuid.UUID
}

type GetWorkflowHandler struct {
	projectReader ProjectReader
}

func NewGetWorkflowHandler(projectReader ProjectReader) GetWorkflowHandler {
	if projectReader == nil {
		slog.Error("projectReader is nil")
		os.Exit(1)
	}

	return GetWorkflowHandler{
		projectReader: projectReader,
	}
}

func (h GetWorkflowHandler) Handle(ctx context.Context, query GetWorkflowQuery) (Workflow, error) {
	workflow, err := h.projectReader.ReadWorkflow(ctx, query.ProjectID, query.WorkflowID)
	if err != nil {
		return Workflow{}, err
	}

	return workflow, nil
}
