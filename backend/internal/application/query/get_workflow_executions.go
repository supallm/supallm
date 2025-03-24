package query

import (
	"context"
	"log/slog"
	"os"
)

type GetWorkflowExecutionsQuery struct {
	WorkflowID string
}

type GetWorkflowExecutionsHandler struct {
	executionReader ExecutionReader
}

func NewGetWorkflowExecutionsHandler(executionReader ExecutionReader) GetWorkflowExecutionsHandler {
	if executionReader == nil {
		slog.Error("executionReader is nil")
		os.Exit(1)
	}

	return GetWorkflowExecutionsHandler{
		executionReader: executionReader,
	}
}

func (h GetWorkflowExecutionsHandler) Handle(
	ctx context.Context,
	query GetWorkflowExecutionsQuery,
) ([]Execution, error) {
	executions, err := h.executionReader.ReadWorkflowExecutions(ctx, query.WorkflowID)
	if err != nil {
		return nil, err
	}

	return executions, nil
}
