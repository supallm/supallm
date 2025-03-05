package llm

import (
	"context"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/pkg/secret"
)

type openaiService struct {
	client *openai.Client
}

func newOpenAI(key string) *openaiService {
	return &openaiService{
		client: openai.NewClient(option.WithAPIKey(key)),
	}
}

func (o *openaiService) GenerateText(ctx context.Context, request *model.Request) (*model.Response, error) {
	// TODO: Implement
	return nil, nil
}

func (o *openaiService) StreamText(ctx context.Context, request *model.Request) (<-chan struct{}, error) {
	// TODO: Implement
	return nil, nil
}

func (o *openaiService) VerifyKey(ctx context.Context, key secret.ApiKey) error {
	// TODO: Implement
	return nil
}
