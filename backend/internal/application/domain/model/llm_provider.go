package model

import (
	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/secret"
)

type (
	LLMProviderType string
	LLMModel        string
)

func (t LLMProviderType) String() string {
	return string(t)
}

func (t LLMModel) String() string {
	return string(t)
}

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
	APIKey secret.ApiKey
}

func newLLMProvider(id uuid.UUID, name string, providerType LLMProviderType, apiKey secret.ApiKey) (*LLMProvider, error) {
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

func (p *Project) CreateProvider(id uuid.UUID, name string, providerType LLMProviderType, apiKey secret.ApiKey) (*LLMProvider, error) {
	provider, err := newLLMProvider(id, name, providerType, apiKey)
	if err != nil {
		return nil, err
	}

	p.LLMProviders = append(p.LLMProviders, *provider)
	return provider, nil
}

func (p *Project) UpdateProvider(id uuid.UUID, name string, apiKey secret.ApiKey) error {
	if name == "" {
		return ErrProviderNameRequired
	}

	provider, err := p.getProvider(id)
	if err != nil {
		return err
	}

	if apiKey != "" {
		provider.APIKey = apiKey
	}

	provider.Name = name
	return nil
}

func (p *Project) getProviderFromModel(model LLMModel) (*LLMProvider, error) {
	for _, provider := range p.LLMProviders {
		if _, ok := ProviderModels[provider.Type][model]; ok {
			return &provider, nil
		}
	}
	return nil, ErrProviderNotFound
}
