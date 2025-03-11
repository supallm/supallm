package project

import (
	"encoding/json"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/pkg/secret"
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
		ID:          w.ID,
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
		ID:          w.ID,
		Name:        w.Name,
		BuilderFlow: builderFlow,
		CreatedAt:   w.CreatedAt.Time,
		UpdatedAt:   w.UpdatedAt.Time,
	}
}

func (p Project) domain(cs []Credential, ws []Workflow) (*model.Project, error) {
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

	workflows := make(map[uuid.UUID]*model.Workflow)
	for _, w := range ws {
		var workflow *model.Workflow
		workflow, err = w.domain()
		if err != nil {
			return nil, err
		}

		workflows[w.ID] = workflow
	}

	return &model.Project{
		ID:           p.ID,
		UserID:       p.UserID,
		Name:         p.Name,
		AuthProvider: ap,
		Credentials:  llmCredentials,
		Workflows:    workflows,
	}, nil
}

func (p Project) query(cs []Credential, ws []Workflow) query.Project {
	ap := p.AuthProvider.query()

	llmCredentials := make([]query.Credential, len(cs))
	for i, llmCredential := range cs {
		llmCredentials[i] = llmCredential.query()
	}

	workflows := make([]query.Workflow, len(ws))
	for i, w := range ws {
		workflows[i] = *w.query()
	}

	return query.Project{
		ID:           p.ID,
		Name:         p.Name,
		AuthProvider: ap,
		Credentials:  llmCredentials,
		Workflows:    workflows,
		CreatedAt:    p.CreatedAt.Time,
		UpdatedAt:    p.UpdatedAt.Time,
	}
}
