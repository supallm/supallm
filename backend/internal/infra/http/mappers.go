package http

import (
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/infra/http/gen"
)

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

func queryCredentialsToDTOs(credentials []query.Credential) []gen.Credential {
	dtos := make([]gen.Credential, len(credentials))
	for i, credential := range credentials {
		dtos[i] = queryCredentialToDTO(credential)
	}
	return dtos
}

func queryModelToDTO(model query.Model) gen.Model {
	return gen.Model{
		Id:            model.ID,
		Name:          model.Name,
		CreatedAt:     model.CreatedAt,
		UpdatedAt:     model.UpdatedAt,
		Slug:          model.Slug.String(),
		SystemPrompt:  model.SystemPrompt,
		CredentialId:  model.CredentialID,
		ProviderModel: gen.ProviderModel(model.Model),
		Parameters: gen.ModelParameters{
			MaxTokens:   int(model.Parameters.MaxTokens),
			Temperature: float32(model.Parameters.Temperature),
		},
	}
}

func queryModelsToDTOs(models []query.Model) []gen.Model {
	dtos := make([]gen.Model, len(models))
	for i, model := range models {
		dtos[i] = queryModelToDTO(model)
	}
	return dtos
}

func queryProjectToDTO(project query.Project) gen.Project {
	models := make([]gen.Model, len(project.Models))
	for i, model := range project.Models {
		models[i] = queryModelToDTO(model)
	}

	credentials := make([]gen.Credential, len(project.Credentials))
	for i, credential := range project.Credentials {
		credentials[i] = queryCredentialToDTO(credential)
	}

	return gen.Project{
		Id:   project.ID,
		Name: project.Name,
		AuthProvider: gen.AuthProvider{
			Provider: gen.AuthProviderProvider(project.AuthProvider.Provider),
			Config:   project.AuthProvider.Config,
		},
		Credentials: credentials,
		Models:      models,
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
