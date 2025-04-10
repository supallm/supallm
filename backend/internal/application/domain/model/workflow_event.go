package model

import (
	"encoding/json"

	"github.com/google/uuid"
)

type WorkflowEventType string

const (
	WorkflowStarted           WorkflowEventType = "WORKFLOW_STARTED"
	WorkflowCompleted         WorkflowEventType = "WORKFLOW_COMPLETED"
	WorkflowFailed            WorkflowEventType = "WORKFLOW_FAILED"
	WorkflowNodeStarted       WorkflowEventType = "NODE_STARTED"
	WorkflowNodeCompleted     WorkflowEventType = "NODE_COMPLETED"
	WorkflowNodeFailed        WorkflowEventType = "NODE_FAILED"
	WorkflowEventNodeResult   WorkflowEventType = "NODE_RESULT"
	WorkflowEventNodeLog      WorkflowEventType = "NODE_LOG"
	WorkflowAgentNotification WorkflowEventType = "AGENT_NOTIFICATION"
)

type WorkflowEvent struct {
	ID         uuid.UUID
	ProjectID  uuid.UUID
	WorkflowID WorkflowID
	TriggerID  uuid.UUID
	EventType  WorkflowEventType
	Data       json.RawMessage
}
