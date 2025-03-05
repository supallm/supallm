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
	Credentials  []Credential
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
	Credential   Credential
	Name         string
	Slug         slug.Slug
	Model        string
	SystemPrompt string
	Parameters   ModelParameters
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type ModelParameters struct {
	MaxTokens   int
	Temperature float64
}

type Credential struct {
	ID               uuid.UUID
	Name             string
	Provider         string
	ObfuscatedApiKey string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
