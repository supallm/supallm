package runner

import (
	"context"
	"encoding/json"
	"log/slog"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/event"
)

type Service struct {
	publisher message.Publisher
}

func NewService(_ context.Context, publisher message.Publisher) *Service {
	return &Service{
		publisher: publisher,
	}
}

func (s *Service) QueueWorkflow(
	ctx context.Context,
	triggerID uuid.UUID,
	workflow *model.Workflow,
	inputs map[string]any,
) error {
	queueMsg := workflowQueueMessage{
		WorkflowID: workflow.ID,
		TriggerID:  triggerID,
		SessionID:  uuid.New(),
		ProjectID:  workflow.ProjectID,
		Definition: workflow.RunnerFlow,
		Inputs:     inputs,
	}

	msg, err := queueMsg.ToMessage()
	if err != nil {
		slog.Error("failed to create message", "error", err)
		return err
	}

	slog.Info("publishing workflow queue message",
		"workflow_id", workflow.ID,
		"trigger_id", triggerID,
		"topic", event.DownstreamWorkflowRunTopic)

	err = s.publisher.Publish(event.DownstreamWorkflowRunTopic, msg)
	if err != nil {
		slog.Error("failed to publish message", "error", err)
		return err
	}

	slog.Info("successfully published workflow queue message")
	return nil
}

type workflowQueueMessage struct {
	WorkflowID model.WorkflowID `json:"workflow_id"`
	TriggerID  uuid.UUID        `json:"trigger_id"`
	ProjectID  uuid.UUID        `json:"project_id"`
	SessionID  uuid.UUID        `json:"session_id"`
	Definition json.RawMessage  `json:"definition"`
	Inputs     map[string]any   `json:"inputs"`
}

func (q workflowQueueMessage) ToMessage() (*message.Message, error) {
	payload, err := json.Marshal(q)
	if err != nil {
		return nil, err
	}

	msg := message.NewMessage(uuid.New().String(), payload)
	event.SetCorrelationID(msg, q.TriggerID.String())

	return msg, nil
}
