package runner

import (
	"context"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/supallm/core/internal/application/domain/model"
)

type Service struct {
	client *redis.Client
}

func NewService(_ context.Context, client *redis.Client) *Service {
	return &Service{
		client: client,
	}
}

func (s *Service) QueueWorkflow(
	ctx context.Context,
	triggerID uuid.UUID,
	workflow *model.Workflow,
	inputs map[string]any,
) error {
	return nil
}
