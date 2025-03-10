package runner

import (
	"context"

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
		return err
	}

	queueMsg := event.WorkflowQueueMessage{
		WorkflowID: workflow.ID,
		TriggerID:  triggerID,
		ProjectID:  workflow.ProjectID,
		Definition: definitionJSON,
		Inputs:     inputs,
	}

	msg, err := queueMsg.ToMessage()
	if err != nil {
		return err
	}

	return s.publisher.Publish(event.TopicWorkflowQueue, msg)
}
