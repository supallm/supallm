package llm

import (
	"context"
	"sync"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/pkg/slug"
)

type OpenAI struct {
	clients map[slug.Slug]*openai.Client
	mu      sync.Mutex
}

func NewOpenAI() *OpenAI {
	clients := make(map[slug.Slug]*openai.Client)
	return &OpenAI{
		clients: clients,
	}
}

func (o *OpenAI) getClient(slug slug.Slug, apiKey string) (*openai.Client, error) {
	o.mu.Lock()
	defer o.mu.Unlock()

	client, ok := o.clients[slug]
	if ok {
		return client, nil
	}

	client = openai.NewClient(
		option.WithAPIKey(apiKey),
	)

	o.clients[slug] = client
	return client, nil
}

func (o *OpenAI) GenerateText(ctx context.Context, request *model.LLMRequest) (*model.LLMResponse, error) {
	_, err := o.getClient(request.Model.Slug, request.Model.Provider.APIKey.String())
	if err != nil {
		return nil, err
	}

	// TODO: Implement

	return nil, nil
}

func (o *OpenAI) StreamText(ctx context.Context, request *model.LLMRequest) (<-chan struct{}, error) {
	_, err := o.getClient(request.Model.Slug, request.Model.Provider.APIKey.String())
	if err != nil {
		return nil, err
	}

	// TODO: Implement

	return nil, nil
}
