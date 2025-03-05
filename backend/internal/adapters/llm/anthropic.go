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

func (a *anthropicService) GenerateText(ctx context.Context, request *model.Request) (*model.Response, error) {
	// TODO: Implement
	return nil, nil
}

func (a *anthropicService) StreamText(ctx context.Context, request *model.Request) (<-chan struct{}, error) {
	// TODO: Implement
	return nil, nil
}

func (a *anthropicService) VerifyKey(ctx context.Context, key secret.ApiKey) error {
	// TODO: Implement
	return nil
}
