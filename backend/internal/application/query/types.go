package query

import (
	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/slug"
)

type Project struct {
	ID           uuid.UUID
	Name         string
	AuthProvider AuthProvider
	LLMProviders []LLMProvider
	Models       []Model
}

type AuthProvider struct {
	Provider string
	Config   map[string]any
}

type Model struct {
	ID           uuid.UUID
	Slug         slug.Slug
	Provider     LLMProvider
	Model        string
	SystemPrompt string
}

type LLMProvider struct {
	ID               uuid.UUID
	Name             string
	Provider         string
	ObfuscatedApiKey string
}
