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
	Slug         slug.Slug
	Name         string
	CredentialID uuid.UUID
	Model        string
	SystemPrompt string
	Parameters   ModelParameters
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type ModelParameters struct {
	MaxTokens   uint32
	Temperature float64
}

type Credential struct {
	ID               uuid.UUID
	Name             string
	Provider         string
	ObfuscatedAPIKey string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
