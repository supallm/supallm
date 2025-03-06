package llm

import (
	"context"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/pkg/secret"
)

type anthropicService struct {
	client *anthropic.Client
}

func newAnthropic(key string) *anthropicService {
	return &anthropicService{
		client: anthropic.NewClient(option.WithAPIKey(key)),
	}
}

func (a *anthropicService) GenerateText(_ context.Context, _ *model.Request) (*model.Response, error) {
	return nil, nil
}

func (a *anthropicService) StreamText(_ context.Context, _ *model.Request) (<-chan struct{}, error) {
	return nil, nil
}

func (a *anthropicService) VerifyKey(_ context.Context, _ secret.APIKey) error {
	return nil
}
