package llm

import (
	"context"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/pkg/secret"
)

type OpenAI struct {
	client *openai.Client
}

func newOpenAI(key string) *OpenAI {
	return &OpenAI{
		client: openai.NewClient(option.WithAPIKey(key)),
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

func (o *OpenAI) VerifyKey(ctx context.Context, key secret.ApiKey) error {
	// TODO: Implement
	return nil
}
