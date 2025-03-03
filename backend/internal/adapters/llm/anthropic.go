package llm

import (
	"context"
	"sync"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/pkg/slug"
)

type Anthropic struct {
	clients map[slug.Slug]*anthropic.Client
	mu      sync.Mutex
}

func NewAnthropic() *Anthropic {
	return &Anthropic{
		clients: make(map[slug.Slug]*anthropic.Client),
	}
}

func (a *Anthropic) getClient(slug slug.Slug, apiKey string) (*anthropic.Client, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	client, ok := a.clients[slug]
	if ok {
		return client, nil
	}

	client = anthropic.NewClient(
		option.WithAPIKey(apiKey),
	)

	a.clients[slug] = client
	return client, nil
}

func (a *Anthropic) GenerateText(ctx context.Context, request *model.LLMRequest) (*model.LLMResponse, error) {
	_, err := a.getClient(request.Model.Slug, request.Model.Provider.APIKey)
	if err != nil {
		return nil, err
	}

	// TODO: Implement

	return nil, nil
}

func (a *Anthropic) StreamText(ctx context.Context, request *model.LLMRequest) (<-chan struct{}, error) {
	_, err := a.getClient(request.Model.Slug, request.Model.Provider.APIKey)
	if err != nil {
		return nil, err
	}

	// TODO: Implement

	return nil, nil
}
