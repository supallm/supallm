package model

import (
	"encoding/json"

	"github.com/google/uuid"
)

type WorkflowEventType string

const (
	WorkflowStarted         WorkflowEventType = "WORKFLOW_STARTED"
	WorkflowCompleted       WorkflowEventType = "WORKFLOW_COMPLETED"
	WorkflowFailed          WorkflowEventType = "WORKFLOW_FAILED"
	WorkflowNodeStarted     WorkflowEventType = "NODE_STARTED"
	WorkflowNodeCompleted   WorkflowEventType = "NODE_COMPLETED"
	WorkflowNodeFailed      WorkflowEventType = "NODE_FAILED"
	WorkflowEventNodeResult WorkflowEventType = "NODE_RESULT"
	WorkflowEventNodeLog    WorkflowEventType = "NODE_LOG"
)

func (e WorkflowEventType) IsWorkflowEvent() bool {
	return e == WorkflowStarted ||
		e == WorkflowNodeStarted ||
		e == WorkflowNodeCompleted
}

func (e WorkflowEventType) IsWorkflowEnded() bool {
	return e == WorkflowCompleted ||
		e == WorkflowFailed
}

func (e WorkflowEventType) IsNodeEvent() bool {
	return e == WorkflowEventNodeResult
}

func (e WorkflowEventType) IsNodeLog() bool {
	return e == WorkflowEventNodeLog
}

func (e WorkflowEventType) IsNodeError() bool {
	return e == WorkflowNodeFailed
}

type WorkflowEvent struct {
	ID         uuid.UUID
	ProjectID  uuid.UUID
	WorkflowID WorkflowID
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
