package model

import (
	"encoding/json"

	"github.com/google/uuid"
)

type WorkflowEventType string

const (
	WorkflowStarted       WorkflowEventType = "workflow_started"
	WorkflowCompleted     WorkflowEventType = "workflow_completed"
	WorkflowFailed        WorkflowEventType = "workflow_failed"
	WorkflowNodeStarted   WorkflowEventType = "workflow_node_started"
	WorkflowNodeCompleted WorkflowEventType = "workflow_node_completed"
	WorkflowNodeFailed    WorkflowEventType = "workflow_node_failed"
)

type WorkflowEvent struct {
	ID         uuid.UUID
	ProjectID  uuid.UUID
	WorkflowID uuid.UUID
	TriggerID  uuid.UUID
	EventType  WorkflowEventType
	Data       json.RawMessage
}

func (w *Workflow) CreateEvent(
	id, triggerID uuid.UUID,
	eventType WorkflowEventType,
	data json.RawMessage,
) (*WorkflowEvent, error) {
	return &WorkflowEvent{
		ID:         id,
		ProjectID:  w.ProjectID,
		WorkflowID: w.ID,
		TriggerID:  triggerID,
		EventType:  eventType,
		Data:       data,
	}, nil
}
