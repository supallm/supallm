package query

import (
	"time"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/pkg/secret"
)

type Project struct {
	ID           uuid.UUID
	Name         string
	AuthProvider AuthProvider
	Credentials  []Credential
	Workflows    []Workflow
	APIKeys      []APIKey
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type APIKey struct {
	ID        uuid.UUID
	Key       secret.APIKey
	CreatedAt time.Time
	UpdatedAt time.Time
}

type AuthProvider struct {
	Provider string
	Config   map[string]any
}

type Workflow struct {
	ID          model.WorkflowID
	Name        string
	BuilderFlow map[string]any
	CreatedAt   time.Time
	UpdatedAt   time.Time
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

type WorkflowEvent struct {
	WorkflowID uuid.UUID
	TriggerID  uuid.UUID
	EventType  string
	Data       map[string]any
}

type User struct {
	ID        uuid.UUID
	Email     string
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
}
