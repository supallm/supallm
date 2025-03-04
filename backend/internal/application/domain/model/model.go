package model

import (
	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/slug"
)

type Model struct {
	ID           uuid.UUID
	Slug         slug.Slug
	ProviderId   uuid.UUID
	Model        LLMModel
	SystemPrompt Prompt
}

func (p *Project) AddModel(id uuid.UUID, slug slug.Slug, llmProviderId uuid.UUID, llmModel LLMModel, systemPrompt Prompt) error {
	provider, err := p.getProvider(llmProviderId)
	if err != nil {
		return err
	}

	if _, ok := ProviderModels[provider.Type][llmModel]; !ok {
		return ErrLLMModelNotSupported
	}

	model := Model{
		ID:           id,
		Slug:         slug,
		ProviderId:   llmProviderId,
		Model:        llmModel,
		SystemPrompt: systemPrompt,
	}

	if _, ok := p.Models[slug]; ok {
		return ErrModelExists
	}

	p.Models[slug] = model
	return nil
}

func (p *Project) getModel(slug slug.Slug) (*Model, error) {
	model, ok := p.Models[slug]
	if !ok {
		return nil, ErrModelNotFound
	}

	return &model, nil
}

func (p *Project) UpdateModel(slug slug.Slug, llmProviderId uuid.UUID, llmModel LLMModel, systemPrompt Prompt) error {
	model, err := p.getModel(slug)
	if err != nil {
		return err
	}

	provider, err := p.getProvider(llmProviderId)
	if err != nil {
		return err
	}

	if _, ok := ProviderModels[provider.Type][llmModel]; !ok {
		return ErrLLMModelNotSupported
	}

	model.ProviderId = llmProviderId
	model.Model = llmModel
	model.SystemPrompt = systemPrompt
	return nil
}
