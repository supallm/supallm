package llm

import (
	"context"
	"fmt"
	"sync"

	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/pkg/secret"
)

type llm interface {
	GenerateText(ctx context.Context, request *model.LLMRequest) (*model.LLMResponse, error)
	StreamText(ctx context.Context, request *model.LLMRequest) (<-chan struct{}, error)
	VerifyKey(ctx context.Context, apiKey secret.ApiKey) error
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
	}
}

func (r *ProviderRegistry) getLLM(credential *model.LLMCredential) (llm, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

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
		}
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
		}
		return client, nil

	default:
		return nil, fmt.Errorf("unsupported provider type: %s", credential.ProviderType)
	}
}

func (r *ProviderRegistry) GenerateText(ctx context.Context, request *model.LLMRequest) (*model.LLMResponse, error) {
	llm, err := r.getLLM(request.Model.LLMCredential)
	if err != nil {
		return nil, err
	}
	return llm.GenerateText(ctx, request)
}

func (r *ProviderRegistry) StreamText(ctx context.Context, request *model.LLMRequest) (<-chan struct{}, error) {
	llm, err := r.getLLM(request.Model.LLMCredential)
	if err != nil {
		return nil, err
	}
	return llm.StreamText(ctx, request)
}

func (r *ProviderRegistry) VerifyKey(ctx context.Context, credential *model.LLMCredential) error {
	llm, err := r.getLLM(credential)
	if err != nil {
		return err
	}
	return llm.VerifyKey(ctx, credential.APIKey)
}
