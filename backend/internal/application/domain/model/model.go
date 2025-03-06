package model

import (
	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/slug"
)

type Model struct {
	ID            uuid.UUID
	Slug          slug.Slug
	Name          string
	Credential    *Credential
	ProviderModel ProviderModel
	SystemPrompt  Prompt
	Parameters    ModelParameters
}

//nolint:all
type ModelParameters struct {
	MaxTokens   uint32  `json:"max_tokens"`
	Temperature float64 `json:"temperature"`
}

func (mp ModelParameters) Map() map[string]any {
	return map[string]any{
		"max_tokens":  mp.MaxTokens,
		"temperature": mp.Temperature,
	}
}

func (p *Project) AddModel(
	id uuid.UUID,
	name string,
	slug slug.Slug,
	credentialID uuid.UUID,
	providerModel ProviderModel,
	systemPrompt Prompt,
	parameters ModelParameters,
) error {
	credential, err := p.getCredential(credentialID)
	if err != nil {
		return err
	}

	if _, ok := providerModels[credential.ProviderType][providerModel]; !ok {
		return ErrProviderModelNotSupported
	}

	model := Model{
		ID:            id,
		Slug:          slug,
		Name:          name,
		Credential:    credential,
		ProviderModel: providerModel,
		SystemPrompt:  systemPrompt,
		Parameters:    parameters,
	}

	if _, ok := p.Models[slug]; ok {
		return ErrModelExists
	}

	p.Models[slug] = &model
	return nil
}

func (p *Project) GetModel(slug slug.Slug) (*Model, error) {
	model, ok := p.Models[slug]
	if !ok {
		return nil, ErrModelNotFound
	}

	return model, nil
}

func (p *Project) UpdateModelName(slug slug.Slug, name string) error {
	if name == "" {
		return nil
	}

	model, ok := p.Models[slug]
	if !ok {
		return ErrModelNotFound
	}

	model.Name = name
	return nil
}

func (p *Project) UpdateModelParameters(slug slug.Slug, systemPrompt Prompt, parameters ModelParameters) error {
	model, ok := p.Models[slug]
	if !ok {
		return ErrModelNotFound
	}

	model.Parameters = parameters
	model.SystemPrompt = systemPrompt
	return nil
}

func (p *Project) UpdateModelLLMCredential(slug slug.Slug, credentialID uuid.UUID) error {
	model, ok := p.Models[slug]
	if !ok {
		return ErrModelNotFound
	}

	credential, err := p.getCredential(credentialID)
	if err != nil {
		return err
	}

	if credential == nil {
		return ErrInvalidCredential
	}

	if credential.ProviderType != model.Credential.ProviderType {
		return ErrInvalidCredential
	}

	model.Credential = credential
	return nil
}

func (p *Project) UpdateModelProviderModel(slug slug.Slug, providerModel ProviderModel) error {
	model, ok := p.Models[slug]
	if !ok {
		return ErrModelNotFound
	}

	if _, ok = providerModels[model.Credential.ProviderType][providerModel]; !ok {
		return ErrProviderModelNotSupported
	}

	model.ProviderModel = providerModel
	return nil
}
