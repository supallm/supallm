package project

import (
	"github.com/google/uuid"
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

func (l LlmCredential) domain() (*model.LLMCredential, error) {
	apiKey, err := secret.Decrypt(l.ApiKeyEncrypted)
	if err != nil {
		return nil, err
	}

	return &model.LLMCredential{
		ID:           l.ID,
		Name:         l.Name,
		ProviderType: model.LLMProviderType(l.ProviderType),
		APIKey:       apiKey,
	}, nil
}

func (l LlmCredential) query() (query.LLMCredential, error) {
	return query.LLMCredential{
		ID:               l.ID,
		Name:             l.Name,
		Provider:         l.ProviderType,
		ObfuscatedApiKey: l.ApiKeyObfuscated,
		CreatedAt:        l.CreatedAt.Time,
		UpdatedAt:        l.UpdatedAt.Time,
	}, nil
}

func (m Model) domain() (*model.Model, error) {
	return &model.Model{
		ID:           m.ID,
		Slug:         slug.Slug(m.Slug),
		LLMModel:     model.LLMModel(m.LlmModel),
		SystemPrompt: model.Prompt(m.SystemPrompt),
	}, nil
}

func (m Model) query() (query.Model, error) {
	return query.Model{
		ID:           m.ID,
		Slug:         slug.Slug(m.Slug),
		Model:        m.LlmModel,
		SystemPrompt: m.SystemPrompt,
		CreatedAt:    m.CreatedAt.Time,
		UpdatedAt:    m.UpdatedAt.Time,
	}, nil
}

func (p Project) domain(cs []LlmCredential, ms []Model) (*model.Project, error) {
	ap, err := p.AuthProvider.domain()
	if err != nil {
		return nil, err
	}

	llmCredentials := make(map[uuid.UUID]*model.LLMCredential)
	for _, llmCredential := range cs {
		llmCredentials[llmCredential.ID], err = llmCredential.domain()
		if err != nil {
			return nil, err
		}
	}

	models := make(map[slug.Slug]*model.Model)
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
		Credentials:  llmCredentials,
		Models:       models,
	}, nil
}

func (p Project) query(cs []LlmCredential, ms []Model) (query.Project, error) {
	ap, err := p.AuthProvider.query()
	if err != nil {
		return query.Project{}, err
	}

	llmCredentials := make([]query.LLMCredential, len(cs))
	for i, llmCredential := range cs {
		llmCredentials[i], err = llmCredential.query()
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
		Credentials:  llmCredentials,
		Models:       models,
		CreatedAt:    p.CreatedAt.Time,
		UpdatedAt:    p.UpdatedAt.Time,
	}, nil
}
