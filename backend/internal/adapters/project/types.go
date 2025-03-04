package project

import (
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/pkg/secret"
	"github.com/supallm/core/internal/pkg/slug"
)

type authProvider struct {
	Type   string         `json:"type"`
	Config map[string]any `json:"config"`
}

func (a authProvider) domain() (model.AuthProvider, error) {
	return model.UnmarshalAuthProvider(model.AuthProviderType(a.Type), a.Config)
}

func (a authProvider) query() (query.AuthProvider, error) {
	return query.AuthProvider{
		Provider: a.Type,
		Config:   a.Config,
	}, nil
}

func (l LlmProvider) domain() (model.LLMProvider, error) {
	apiKey, err := secret.Decrypt(l.ApiKeyEncrypted)
	if err != nil {
		return model.LLMProvider{}, err
	}

	return model.LLMProvider{
		ID:     l.ID,
		Name:   l.Name,
		Type:   model.LLMProviderType(l.ProviderType),
		APIKey: apiKey,
	}, nil
}

func (l LlmProvider) query() (query.LLMProvider, error) {
	return query.LLMProvider{
		ID:               l.ID,
		Name:             l.Name,
		Provider:         l.ProviderType,
		ObfuscatedApiKey: l.ApiKeyObfuscated,
	}, nil
}

func (m Model) domain() (model.Model, error) {
	return model.Model{
		ID:           m.ID,
		Slug:         slug.Slug(m.Slug),
		ProviderId:   m.ProviderID,
		Model:        model.LLMModel(m.LlmModel),
		SystemPrompt: model.Prompt(m.SystemPrompt),
	}, nil
}

func (m Model) query() (query.Model, error) {
	return query.Model{
		ID:           m.ID,
		ProviderId:   m.ProviderID,
		Slug:         slug.Slug(m.Slug),
		Model:        m.LlmModel,
		SystemPrompt: m.SystemPrompt,
	}, nil
}

func (p Project) domain(ps []LlmProvider, ms []Model) (*model.Project, error) {
	ap, err := p.AuthProvider.domain()
	if err != nil {
		return nil, err
	}

	llmProviders := make([]model.LLMProvider, len(ps))
	for i, llmProvider := range ps {
		llmProviders[i], err = llmProvider.domain()
		if err != nil {
			return nil, err
		}
	}

	models := make(map[slug.Slug]model.Model)
	for _, m := range ms {
		models[slug.Slug(m.Slug)], err = m.domain()
		if err != nil {
			return nil, err
		}
	}

	return &model.Project{
		ID:           p.ID,
		Name:         p.Name,
		AuthProvider: ap,
		LLMProviders: llmProviders,
		Models:       models,
	}, nil
}

func (p Project) query(ps []LlmProvider, ms []Model) (query.Project, error) {
	ap, err := p.AuthProvider.query()
	if err != nil {
		return query.Project{}, err
	}

	llmProviders := make([]query.LLMProvider, len(ps))
	for i, llmProvider := range ps {
		llmProviders[i], err = llmProvider.query()
		if err != nil {
			return query.Project{}, err
		}
	}

	models := make([]query.Model, len(ms))
	for i, m := range ms {
		models[i], err = m.query()
		if err != nil {
			return query.Project{}, err
		}
	}

	return query.Project{
		ID:           p.ID,
		Name:         p.Name,
		AuthProvider: ap,
		LLMProviders: llmProviders,
		Models:       models,
	}, nil
}
