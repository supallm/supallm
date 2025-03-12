package event

import (
	"encoding/json"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/google/uuid"
)

const (
	// Event types
	TypeWorkflowStarted   = "WORKFLOW_STARTED"
	TypeWorkflowCompleted = "WORKFLOW_COMPLETED"
	TypeWorkflowFailed    = "WORKFLOW_FAILED"
	TypeNodeStarted       = "NODE_STARTED"
	TypeNodeStreaming     = "NODE_STREAMING"
	TypeNodeCompleted     = "NODE_COMPLETED"
	TypeNodeFailed        = "NODE_FAILED"
)

type WorkflowEventMessage struct {
	Type       string         `json:"type"`
	WorkflowID uuid.UUID      `json:"workflow_id"`
	TriggerID  uuid.UUID      `json:"trigger_id"`
	SessionID  uuid.UUID      `json:"session_id"`
	NodeID     string         `json:"node_id,omitempty"`
	Data       map[string]any `json:"data,omitempty"`
}

type WorkflowQueueMessage struct {
	WorkflowID uuid.UUID       `json:"workflow_id"`
	TriggerID  uuid.UUID       `json:"trigger_id"`
	ProjectID  uuid.UUID       `json:"project_id"`
	SessionID  uuid.UUID       `json:"session_id"`
	Definition json.RawMessage `json:"definition"`
	Inputs     map[string]any  `json:"inputs"`
}

func (e WorkflowEventMessage) ToMessage() (*message.Message, error) {
	payload, err := json.Marshal(e)
	if err != nil {
		return nil, err
	}

	msg := message.NewMessage(e.TriggerID.String(), payload)
	msg.Metadata.Set("type", e.Type)
	msg.Metadata.Set("workflow_id", e.WorkflowID.String())

	return msg, nil
}

func (q WorkflowQueueMessage) ToMessage() (*message.Message, error) {
	payload, err := json.Marshal(q)
	if err != nil {
		return nil, err
	}

	msg := message.NewMessage(q.TriggerID.String(), payload)
	msg.Metadata.Set("workflow_id", q.WorkflowID.String())

	return msg, nil
}

func WorkflowEventFromMessage(msg *message.Message) (WorkflowEventMessage, error) {
	var event WorkflowEventMessage
	if err := json.Unmarshal(msg.Payload, &event); err != nil {
		return WorkflowEventMessage{}, err
	}
	return event, nil
}

func WorkflowQueueMessageFromMessage(msg *message.Message) (WorkflowQueueMessage, error) {
	var queue WorkflowQueueMessage
	if err := json.Unmarshal(msg.Payload, &queue); err != nil {
		return WorkflowQueueMessage{}, err
	}
	return queue, nil
}
