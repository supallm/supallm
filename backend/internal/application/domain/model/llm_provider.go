package model

import (
	"github.com/google/uuid"
)

type (
	LLMProviderType string
	LLMModel        string
)

const (
	ProviderTypeOpenAI    LLMProviderType = "openai"
	ProviderTypeAnthropic LLMProviderType = "anthropic"

	ModelGPT4o     LLMModel = "gpt-4o"
	ModelGPT4oMini LLMModel = "gpt-4o-mini"

	ModelClaude37Sonnet LLMModel = "claude-3-7-sonnet"
	ModelClaude35Sonnet LLMModel = "claude-3-5-sonnet"
	ModelClaude35Haiku  LLMModel = "claude-3-5-haiku"
)

var ProviderModels = map[LLMProviderType]map[LLMModel]struct{}{
	ProviderTypeOpenAI: {
		ModelGPT4o:     {},
		ModelGPT4oMini: {},
	},
	ProviderTypeAnthropic: {
		ModelClaude37Sonnet: {},
		ModelClaude35Sonnet: {},
		ModelClaude35Haiku:  {},
	},
}

type LLMProvider struct {
	ID     uuid.UUID
	Name   string
	Type   LLMProviderType
	APIKey ApiKey
}

func newLLMProvider(id uuid.UUID, name string, providerType LLMProviderType, apiKey ApiKey) (*LLMProvider, error) {
	return &LLMProvider{
		ID:     id,
		Name:   name,
		Type:   providerType,
		APIKey: apiKey,
	}, nil
}

func (c *Project) getProvider(id uuid.UUID) (*LLMProvider, error) {
	for _, provider := range c.LLMProviders {
		if provider.ID == id {
			return &provider, nil
		}
	}

	return nil, ErrProviderNotFound
}

func (p *Project) AddProvider(id uuid.UUID, name string, providerType LLMProviderType, apiKey ApiKey) error {
	provider, err := newLLMProvider(id, name, providerType, apiKey)
	if err != nil {
		return err
	}

	p.LLMProviders = append(p.LLMProviders, *provider)
	return nil
}

func (p *Project) RemoveProvider(providerID uuid.UUID) error {
	for i, provider := range p.LLMProviders {
		if provider.ID == providerID {
			p.LLMProviders = append(p.LLMProviders[:i], p.LLMProviders[i+1:]...)
			return nil
		}
	}
	return ErrProviderNotFound
}

func (p *Project) UpdateProvider(id uuid.UUID, name string, apiKey ApiKey) error {
	provider, err := p.getProvider(id)
	if err != nil {
		return err
	}

	provider.Name = name
	provider.APIKey = apiKey
	return nil
}
