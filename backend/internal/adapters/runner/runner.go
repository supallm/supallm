package runner

import (
	"context"

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

func (s *Service) QueueWorkflow(ctx context.Context, workflow *model.Workflow) error {
	return nil
}
