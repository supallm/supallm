package query

import (
	"time"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/slug"
)

type Project struct {
	ID           uuid.UUID
	Name         string
	AuthProvider AuthProvider
	Credentials  []LLMCredential
	Models       []Model
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type AuthProvider struct {
	Provider string
	Config   map[string]any
}

type Model struct {
	ID           uuid.UUID
	ProviderId   uuid.UUID
	Slug         slug.Slug
	Model        string
	SystemPrompt string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type LLMCredential struct {
	ID               uuid.UUID
	Name             string
	Provider         string
	ObfuscatedApiKey string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
