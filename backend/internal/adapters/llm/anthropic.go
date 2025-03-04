package llm

import (
	"context"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/pkg/secret"
)

type Anthropic struct {
	client *anthropic.Client
}

func newAnthropic(key string) *Anthropic {
	return &Anthropic{
		client: anthropic.NewClient(option.WithAPIKey(key)),
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

func (a *Anthropic) VerifyKey(ctx context.Context, key secret.ApiKey) error {
	// TODO: Implement
	return nil
}
