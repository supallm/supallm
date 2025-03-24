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

type Execution struct {
	WorkflowID     string
	SessionID      string
	TriggerID      string
	WorkflowInputs WorkflowInputs
	NodeExecutions map[string]NodeExecution
	CompletedNodes []string
	AllNodes       []string
}

type WorkflowInputs struct {
	Prompt string
}

type NodeExecution struct {
	ID            string
	Success       bool
	Inputs        map[string]any
	Output        map[string]any
	ExecutionTime int
}
