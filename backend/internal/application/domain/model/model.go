package model

import (
	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/slug"
)

type Model struct {
	ID            uuid.UUID
	Slug          slug.Slug
	Name          string
	LLMCredential *LLMCredential
	LLMModel      LLMModel
	SystemPrompt  Prompt
	Parameters    ModelParameters
}

type ModelParameters struct {
	MaxTokens   uint32  `json:"max_tokens"`
	Temperature float64 `json:"temperature"`
}

func (p *Project) AddModel(id uuid.UUID, name string, slug slug.Slug, credentialID uuid.UUID, llmModel LLMModel, systemPrompt Prompt, parameters ModelParameters) error {
	credential, err := p.GetCredential(credentialID)
	if err != nil {
		return err
	}

	if _, ok := providerModels[credential.ProviderType][llmModel]; !ok {
		return ErrLLMModelNotSupported
	}

	model := Model{
		ID:            id,
		Slug:          slug,
		Name:          name,
		LLMCredential: credential,
		LLMModel:      llmModel,
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

	model, err := p.GetModel(slug)
	if err != nil {
		return err
	}

	model.Name = name
	return nil
}

func (p *Project) UpdateModelParameters(slug slug.Slug, systemPrompt Prompt, parameters ModelParameters) error {
	model, err := p.GetModel(slug)
	if err != nil {
		return err
	}

	model.Parameters = parameters
	model.SystemPrompt = systemPrompt
	return nil
}

func (p *Project) UpdateModelLLMCredential(slug slug.Slug, credentialID uuid.UUID) error {
	model, err := p.GetModel(slug)
	if err != nil {
		return err
	}

	credential, err := p.GetCredential(credentialID)
	if err != nil {
		return err
	}

	if credential == nil {
		return ErrInvalidLLMCredential
	}

	if credential.ProviderType != model.LLMCredential.ProviderType {
		return ErrInvalidLLMCredential
	}

	model.LLMCredential = credential
	return nil
}

func (p *Project) UpdateModelLLMModel(slug slug.Slug, llmModel LLMModel) error {
	model, err := p.GetModel(slug)
	if err != nil {
		return err
	}

	if _, ok := providerModels[model.LLMCredential.ProviderType][llmModel]; !ok {
		return ErrLLMModelNotSupported
	}

	model.LLMModel = llmModel
	return nil
}
