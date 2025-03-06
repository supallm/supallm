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

func (o *openaiService) GenerateText(_ context.Context, _ *model.Request) (*model.Response, error) {
	return nil, nil
}

func (o *openaiService) StreamText(_ context.Context, _ *model.Request) (<-chan struct{}, error) {
	return nil, nil
}

func (o *openaiService) VerifyKey(_ context.Context, _ secret.APIKey) error {
	return nil
}
