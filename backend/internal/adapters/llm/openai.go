package llm

import (
	"context"

	"github.com/supallm/core/internal/application/domain/model"
)

type OpenAI struct {
	key string
}

func newOpenAI(key string) *OpenAI {
	return &OpenAI{
		key: key,
	}
}

func (o *OpenAI) GenerateText(ctx context.Context, request *model.LLMRequest) (*model.LLMResponse, error) {
	// TODO: Implement
	return nil, nil
}

func (o *OpenAI) StreamText(ctx context.Context, request *model.LLMRequest) (<-chan struct{}, error) {
	// TODO: Implement
	return nil, nil
}

func (o *OpenAI) VerifyKey(ctx context.Context, key string) error {
	// TODO: Implement
	return nil
}
