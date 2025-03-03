package llm

import (
	"context"

	"github.com/supallm/core/internal/application/domain/model"
)

type InMemory struct{}

func (i *InMemory) GenerateText(ctx context.Context, request *model.LLMRequest) (*model.LLMResponse, error) {
	return nil, nil
}

func (i *InMemory) StreamText(ctx context.Context, request *model.LLMRequest) (<-chan struct{}, error) {
	return nil, nil
}
