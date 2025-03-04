package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
)

// ProjectRepository defines the interface for configuration persistence
type ProjectRepository interface {
	Create(ctx context.Context, project *model.Project) error
	Retrieve(ctx context.Context, id uuid.UUID) (*model.Project, error)
	Update(ctx context.Context, project *model.Project) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// LLMSessionRepository defines the interface for session persistence
type LLMSessionRepository interface {
	Create(ctx context.Context, session *model.LLMSession) error
	Retrieve(ctx context.Context, id uuid.UUID) (*model.LLMSession, error)
	Update(ctx context.Context, session *model.LLMSession) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// LLMProvider defines the interface for interacting with LLM providers
type LLMProvider interface {
	GenerateText(ctx context.Context, request *model.LLMRequest) (*model.LLMResponse, error)
	StreamText(ctx context.Context, request *model.LLMRequest) (<-chan struct{}, error)
	VerifyKey(ctx context.Context, key string) error
}

// ProviderRegistry defines the interface for interacting with provider registries
type ProviderRegistry interface {
	GetLLM(provider *model.LLMProvider) (LLMProvider, error)
}
