package project

import (
	"encoding/json"
	"log/slog"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/query"
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

func (l Credential) domain() *model.Credential {
	return &model.Credential{
		ID:           l.ID,
		Name:         l.Name,
		ProviderType: model.ProviderType(l.ProviderType),
		APIKey:       l.ApiKeyEncrypted,
	}
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

func (a ApiKey) domain() *model.APIKey {
	return &model.APIKey{
		ID:      a.ID,
		KeyHash: a.KeyHash,
	}
}

func (a ApiKey) query() (query.APIKey, error) {
	decrypted, err := a.KeyHash.Decrypt()
	if err != nil {
		slog.Error("failed to decrypt api key", "error", err)
		return query.APIKey{}, err
	}

	return query.APIKey{
		ID:        a.ID,
		Key:       decrypted,
		CreatedAt: a.CreatedAt.Time,
		UpdatedAt: a.UpdatedAt.Time,
	}, nil
}

func (w Workflow) domain() (*model.Workflow, error) {
	builderFlow := model.BuilderFlow{}
	if err := json.Unmarshal(w.BuilderFlow, &builderFlow); err != nil {
		return nil, err
	}

	// runnerFlow := model.RunnerFlow{}
	// if err := json.Unmarshal(w.RunnerFlow, &runnerFlow); err != nil {
	// 	return nil, err
	// }

	return &model.Workflow{
		ID:          model.WorkflowID(w.ID),
		ProjectID:   w.ProjectID,
		Status:      model.WorkflowStatus(w.Status),
		Name:        w.Name,
		BuilderFlow: builderFlow,
		RunnerFlow:  w.RunnerFlow,
	}, nil
}

func (w Workflow) query() *query.Workflow {
	builderFlow := make(map[string]any)
	if err := json.Unmarshal(w.BuilderFlow, &builderFlow); err != nil {
		return nil
	}

	return &query.Workflow{
		ID:          model.WorkflowID(w.ID),
		Name:        w.Name,
		BuilderFlow: builderFlow,
		CreatedAt:   w.CreatedAt.Time,
		UpdatedAt:   w.UpdatedAt.Time,
	}
}

func (p Project) domain(cs []Credential, ws []Workflow, as []ApiKey) (*model.Project, error) {
	ap, err := p.AuthProvider.domain()
	if err != nil {
		return nil, err
	}

	llmCredentials := make(map[uuid.UUID]*model.Credential)
	for _, llmCredential := range cs {
		llmCredentials[llmCredential.ID] = llmCredential.domain()
	}

	apiKeys := make([]*model.APIKey, len(as))
	for i, apiKey := range as {
		apiKeys[i] = apiKey.domain()
	}

	workflows := make(map[model.WorkflowID]*model.Workflow)
	for _, w := range ws {
		var workflow *model.Workflow
		workflow, err = w.domain()
		if err != nil {
			return nil, err
		}

		workflows[model.WorkflowID(w.ID)] = workflow
	}

	return &model.Project{
		ID:           p.ID,
		UserID:       p.UserID,
		Name:         p.Name,
		AuthProvider: ap,
		Credentials:  llmCredentials,
		Workflows:    workflows,
		APIKeys:      apiKeys,
	}, nil
}

func (p Project) query(cs []Credential, ws []Workflow, as []ApiKey) (query.Project, error) {
	ap := p.AuthProvider.query()

	llmCredentials := make([]query.Credential, len(cs))
	for i, llmCredential := range cs {
		llmCredentials[i] = llmCredential.query()
	}

	workflows := make([]query.Workflow, len(ws))
	for i, w := range ws {
		workflows[i] = *w.query()
	}

	apiKeys := make([]query.APIKey, len(as))
	for i, a := range as {
		apiKey, err := a.query()
		if err != nil {
			return query.Project{}, err
		}

		apiKeys[i] = apiKey
	}

	return query.Project{
		ID:           p.ID,
		Name:         p.Name,
		AuthProvider: ap,
		Credentials:  llmCredentials,
		Workflows:    workflows,
		APIKeys:      apiKeys,
		CreatedAt:    p.CreatedAt.Time,
		UpdatedAt:    p.UpdatedAt.Time,
	}, nil
}
