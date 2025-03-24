package query

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
)

type GetTriggerExecutionQuery struct {
	WorkflowID string
	TriggerID  uuid.UUID
}

type GetTriggerExecutionHandler struct {
	executionReader ExecutionReader
}

func NewGetTriggerExecutionHandler(executionReader ExecutionReader) GetTriggerExecutionHandler {
	if executionReader == nil {
		slog.Error("executionReader is nil")
		os.Exit(1)
	}

	return GetTriggerExecutionHandler{
		executionReader: executionReader,
	}
}

func (h GetTriggerExecutionHandler) Handle(ctx context.Context, query GetTriggerExecutionQuery) (Execution, error) {
	execution, err := h.executionReader.ReadTriggerExecution(ctx, query.WorkflowID, query.TriggerID)
	if err != nil {
		return Execution{}, err
	}

	return execution, nil
}
