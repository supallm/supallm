package event

import (
	"encoding/json"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
)

type WorkflowEventMessage struct {
	Type       model.WorkflowEventType `json:"type"`
	WorkflowID model.WorkflowID        `json:"workflowId"`
	TriggerID  uuid.UUID               `json:"triggerId"`
	SessionID  uuid.UUID               `json:"sessionId"`
	Data       map[string]any          `json:"data"`
}

func WorkflowEventFromMessage(msg *message.Message) (WorkflowEventMessage, error) {
	var event WorkflowEventMessage
	if err := json.Unmarshal(msg.Payload, &event); err != nil {
		return WorkflowEventMessage{}, err
	}
	return event, nil
}

func SetCorrelationID(msg *message.Message, correlationID string) {
	msg.Metadata.Set(correlationIDMessageMetadataKey, correlationID)
}
