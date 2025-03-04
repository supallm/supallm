package llm

import (
	"context"

	"github.com/supallm/core/internal/application/domain/model"
)

type Anthropic struct {
	key string
}

func newAnthropic(key string) *Anthropic {
	return &Anthropic{
		key: key,
	}
}

func (a *Anthropic) GenerateText(ctx context.Context, request *model.LLMRequest) (*model.LLMResponse, error) {
	// TODO: Implement
	return nil, nil
}

func (a *Anthropic) StreamText(ctx context.Context, request *model.LLMRequest) (<-chan struct{}, error) {
	// TODO: Implement
	return nil, nil
}

func (a *Anthropic) VerifyKey(ctx context.Context, key string) error {
	// TODO: Implement
	return nil
}
