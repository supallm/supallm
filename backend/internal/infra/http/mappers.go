package http

import (
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/infra/http/gen"
)

type idResponse struct {
	ID string `json:"id"`
}

func queryCredentialToDTO(credential query.Credential) gen.Credential {
	return gen.Credential{
		Id:        credential.ID,
		Name:      credential.Name,
		ApiKey:    credential.ObfuscatedAPIKey,
		Provider:  gen.ProviderType(credential.Provider),
		CreatedAt: credential.CreatedAt,
		UpdatedAt: credential.UpdatedAt,
	}
}

func queryAPIKeyToDTO(apiKey query.APIKey) gen.ApiKey {
	return gen.ApiKey{
		Id:        apiKey.ID,
		Key:       apiKey.Key.String(),
		CreatedAt: apiKey.CreatedAt,
	}
}

func queryCredentialsToDTOs(credentials []query.Credential) []gen.Credential {
	dtos := make([]gen.Credential, len(credentials))
	for i, credential := range credentials {
		dtos[i] = queryCredentialToDTO(credential)
	}
	return dtos
}

func queryWorkflowToDTO(workflow query.Workflow) gen.Workflow {
	return gen.Workflow{
		Id:          workflow.ID.String(),
		Name:        workflow.Name,
		CreatedAt:   workflow.CreatedAt,
		UpdatedAt:   workflow.UpdatedAt,
		BuilderFlow: workflow.BuilderFlow,
	}
}

func queryWorkflowsToDTOs(workflows []query.Workflow) []gen.Workflow {
	dtos := make([]gen.Workflow, len(workflows))
	for i, workflow := range workflows {
		dtos[i] = queryWorkflowToDTO(workflow)
	}
	return dtos
}

func queryProjectToDTO(project query.Project) gen.Project {
	workflows := make([]gen.Workflow, len(project.Workflows))
	for i, workflow := range project.Workflows {
		workflows[i] = queryWorkflowToDTO(workflow)
	}

	credentials := make([]gen.Credential, len(project.Credentials))
	for i, credential := range project.Credentials {
		credentials[i] = queryCredentialToDTO(credential)
	}

	apiKeys := make([]gen.ApiKey, len(project.APIKeys))
	for i, apiKey := range project.APIKeys {
		apiKeys[i] = queryAPIKeyToDTO(apiKey)
	}

	var apiKey gen.ApiKey
	if len(apiKeys) > 0 {
		apiKey = apiKeys[0]
	}

	return gen.Project{
		Id:   project.ID,
		Name: project.Name,
		AuthProvider: gen.AuthProvider{
			Provider: gen.AuthProviderProvider(project.AuthProvider.Provider),
			Config:   project.AuthProvider.Config,
		},
		Credentials: credentials,
		Workflows:   workflows,
		ApiKey:      apiKey,
		CreatedAt:   project.CreatedAt,
		UpdatedAt:   project.UpdatedAt,
	}
}

func queryProjectsToDTOs(projects []query.Project) []gen.Project {
	dtos := make([]gen.Project, len(projects))
	for i, project := range projects {
		dtos[i] = queryProjectToDTO(project)
	}
	return dtos
}
