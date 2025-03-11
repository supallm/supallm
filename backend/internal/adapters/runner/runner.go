package runner

import (
	"context"
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
	definitionJSON, err := workflow.GetRunnerFlowJSON()
	if err != nil {
		slog.Error("failed to get runner flow JSON", "error", err)
		return err
	}

	queueMsg := event.WorkflowQueueMessage{
		WorkflowID: workflow.ID,
		TriggerID:  triggerID,
		SessionID:  uuid.New(),
		ProjectID:  workflow.ProjectID,
		Definition: definitionJSON,
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
		"topic", event.TopicWorkflowQueue)

	err = s.publisher.Publish(event.TopicWorkflowQueue, msg)
	if err != nil {
		slog.Error("failed to publish message", "error", err)
		return err
	}

	slog.Info("successfully published workflow queue message")
	return nil
}
