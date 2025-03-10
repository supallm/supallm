package query

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
)

type ListenWorkflowQuery struct {
	ProjectID  uuid.UUID
	WorkflowID uuid.UUID
	TriggerID  uuid.UUID
}

type ListenWorkflowHandler struct {
	projectReader ProjectReader
}

func NewListenWorkflowHandler(projectReader ProjectReader) ListenWorkflowHandler {
	if projectReader == nil {
		slog.Error("projectReader is nil")
		os.Exit(1)
	}

	return ListenWorkflowHandler{
		projectReader: projectReader,
	}
}

func (h ListenWorkflowHandler) Handle(ctx context.Context, query ListenWorkflowQuery) (WorkflowEvent, error) {
	return WorkflowEvent{
		WorkflowID: query.WorkflowID,
		TriggerID:  query.TriggerID,
		EventType:  "workflow_started",
		Data:       map[string]any{},
	}, nil
}
