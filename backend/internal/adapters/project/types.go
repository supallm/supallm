package project

import (
	"fmt"

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
	if a.Type == "" {
		return nil, nil
	}

	ap, err := model.UnmarshalAuthProvider(model.AuthProviderType(a.Type), a.Config)
	if err != nil {
		return nil, err
	}

	return ap, nil
}

type modelParameters struct {
	MaxTokens   uint32  `json:"max_tokens"`
	Temperature float64 `json:"temperature"`
}

func (a authProvider) query() query.AuthProvider {
	if a.Type == "" {
		return query.AuthProvider{
			Provider: "none",
			Config:   map[string]any{},
		}
	}

	return query.AuthProvider{
		Provider: a.Type,
		Config:   a.Config,
	}
}

func (l Credential) domain() (*model.Credential, error) {
	apiKey, err := secret.Decrypt(l.ApiKeyEncrypted)
	if err != nil {
		return nil, err
	}

	return &model.Credential{
		ID:           l.ID,
		Name:         l.Name,
		ProviderType: model.ProviderType(l.ProviderType),
		APIKey:       apiKey,
	}, nil
}

func (l Credential) query() query.Credential {
	return query.Credential{
		ID:               l.ID,
		Name:             l.Name,
		Provider:         l.ProviderType,
		ObfuscatedAPIKey: l.ApiKeyObfuscated,
		CreatedAt:        l.CreatedAt.Time,
		UpdatedAt:        l.UpdatedAt.Time,
	}
}

func (m Model) domain(credential *model.Credential) *model.Model {
	return &model.Model{
		ID:   m.ID,
		Slug: slug.Slug(m.Slug),
		Name: m.Name,
		Parameters: model.ModelParameters{
			MaxTokens:   m.Parameters.MaxTokens,
			Temperature: m.Parameters.Temperature,
		},
		Credential:    credential,
		ProviderModel: model.ProviderModel(m.ProviderModel),
		SystemPrompt:  model.Prompt(m.SystemPrompt),
	}
}

func (m Model) query() query.Model {
	return query.Model{
		Slug:         slug.Slug(m.Slug),
		CredentialID: m.CredentialID,
		Name:         m.Name,
		Model:        m.ProviderModel,
		SystemPrompt: m.SystemPrompt,
		Parameters: query.ModelParameters{
			MaxTokens:   m.Parameters.MaxTokens,
			Temperature: m.Parameters.Temperature,
		},
		CreatedAt: m.CreatedAt.Time,
		UpdatedAt: m.UpdatedAt.Time,
	}
}

func (p Project) domain(cs []Credential, ms []Model) (*model.Project, error) {
	ap, err := p.AuthProvider.domain()
	if err != nil {
		return nil, err
	}

	llmCredentials := make(map[uuid.UUID]*model.Credential)
	for _, llmCredential := range cs {
		llmCredentials[llmCredential.ID], err = llmCredential.domain()
		if err != nil {
			return nil, err
		}
	}

	models := make(map[slug.Slug]*model.Model)
	for _, m := range ms {
		credential, ok := llmCredentials[m.CredentialID]
		if !ok {
			return nil, fmt.Errorf("credential not found: %s", m.CredentialID)
		}
		models[slug.Slug(m.Slug)] = m.domain(credential)
	}

	return &model.Project{
		ID:           p.ID,
		UserID:       p.UserID,
		Name:         p.Name,
		AuthProvider: ap,
		Credentials:  llmCredentials,
		Models:       models,
	}, nil
}

func (p Project) query(cs []Credential, ms []Model) query.Project {
	ap := p.AuthProvider.query()

	llmCredentials := make([]query.Credential, len(cs))
	for i, llmCredential := range cs {
		llmCredentials[i] = llmCredential.query()
	}

	models := make([]query.Model, len(ms))
	for i, m := range ms {
		models[i] = m.query()
	}

	return query.Project{
		ID:           p.ID,
		Name:         p.Name,
		AuthProvider: ap,
		Credentials:  llmCredentials,
		Models:       models,
		CreatedAt:    p.CreatedAt.Time,
		UpdatedAt:    p.UpdatedAt.Time,
	}
}
