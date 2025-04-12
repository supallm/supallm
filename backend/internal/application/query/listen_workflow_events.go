package query

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/event"
)

type ListenWorkflowQuery struct {
	Sequence   uint64
	WorkflowID model.WorkflowID
	TriggerID  uuid.UUID
}

type ListenWorkflowEventsHandler struct {
	eventReader EventReader
}

func NewListenWorkflowEventsHandler(eventReader EventReader) ListenWorkflowEventsHandler {
	if eventReader == nil {
		slog.Error("eventReader is nil")
		os.Exit(1)
	}

	return ListenWorkflowEventsHandler{
		eventReader: eventReader,
	}
}

func (h ListenWorkflowEventsHandler) Handle(
	ctx context.Context,
	query ListenWorkflowQuery,
) ([]event.WorkflowEventMessage, error) {
	return h.eventReader.ReadWorkflowEvents(ctx, query.WorkflowID, query.TriggerID, query.Sequence)
}
