package llm

import (
	"fmt"
	"sync"

	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/domain/repository"
)

type ProviderRegistry struct {
	openAIClients    map[string]*OpenAI
	anthropicClients map[string]*Anthropic
	mu               sync.RWMutex
}

func NewProviderRegistry() *ProviderRegistry {
	return &ProviderRegistry{
		openAIClients:    make(map[string]*OpenAI),
		anthropicClients: make(map[string]*Anthropic),
	}
}

func (r *ProviderRegistry) GetLLM(provider *model.LLMProvider) (repository.LLMProvider, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	key := provider.ID.String()
	switch provider.Type {
	case model.ProviderTypeOpenAI:
		client, exists := r.openAIClients[key]
		if !exists {
			r.mu.RUnlock()
			r.mu.Lock()
			defer r.mu.Unlock()

			client, exists = r.openAIClients[key]
			if !exists {
				client = newOpenAI(provider.APIKey.String())
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
				client = newAnthropic(provider.APIKey.String())
				r.anthropicClients[key] = client
			}
		}
		return client, nil

	default:
		return nil, fmt.Errorf("unsupported provider type: %s", provider.Type)
	}
}
