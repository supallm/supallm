package llm

import (
	"context"
	"fmt"
	"sync"

	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/pkg/secret"
)

type llm interface {
	GenerateText(ctx context.Context, request *model.Request) (*model.Response, error)
	StreamText(ctx context.Context, request *model.Request) (<-chan struct{}, error)
	VerifyKey(ctx context.Context, apiKey secret.APIKey) error
}

type ProviderRegistry struct {
	openAIClients    map[string]*openaiService
	anthropicClients map[string]*anthropicService
	mu               sync.RWMutex
}

func NewProviderRegistry() *ProviderRegistry {
	return &ProviderRegistry{
		openAIClients:    make(map[string]*openaiService),
		anthropicClients: make(map[string]*anthropicService),
		mu:               sync.RWMutex{},
	}
}

func (r *ProviderRegistry) getProvider(credential *model.Credential) (llm, error) {
	r.mu.RLock()

	key := credential.ID.String()
	switch credential.ProviderType {
	case model.ProviderTypeOpenAI:
		client, exists := r.openAIClients[key]
		if !exists {
			r.mu.RUnlock()
			r.mu.Lock()
			defer r.mu.Unlock()

			client, exists = r.openAIClients[key]
			if !exists {
				client = newOpenAI(credential.APIKey.String())
				r.openAIClients[key] = client
			}
			return client, nil
		}

		r.mu.RUnlock()
		return client, nil

	case model.ProviderTypeAnthropic:
		client, exists := r.anthropicClients[key]
		if !exists {
			r.mu.RUnlock()
			r.mu.Lock()
			defer r.mu.Unlock()

			client, exists = r.anthropicClients[key]
			if !exists {
				client = newAnthropic(credential.APIKey.String())
				r.anthropicClients[key] = client
			}
			return client, nil
		}

		r.mu.RUnlock()
		return client, nil

	default:
		r.mu.RUnlock()
		return nil, fmt.Errorf("unsupported provider type: %s", credential.ProviderType)
	}
}

func (r *ProviderRegistry) GenerateText(ctx context.Context, request *model.Request) (*model.Response, error) {
	provider, err := r.getProvider(request.Model.Credential)
	if err != nil {
		return nil, err
	}
	return provider.GenerateText(ctx, request)
}

func (r *ProviderRegistry) StreamText(ctx context.Context, request *model.Request) (<-chan struct{}, error) {
	provider, err := r.getProvider(request.Model.Credential)
	if err != nil {
		return nil, err
	}
	return provider.StreamText(ctx, request)
}

func (r *ProviderRegistry) VerifyKey(ctx context.Context, credential *model.Credential) error {
	provider, err := r.getProvider(credential)
	if err != nil {
		return err
	}
	return provider.VerifyKey(ctx, credential.APIKey)
}
