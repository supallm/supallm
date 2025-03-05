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

	DeleteProject(ctx context.Context, id uuid.UUID) error
	DeleteLLMCredential(ctx context.Context, id uuid.UUID) error
	DeleteModel(ctx context.Context, id uuid.UUID) error
}

// SessionRepository defines the interface for session persistence
type SessionRepository interface {
	Create(ctx context.Context, session *model.Session) error
	Retrieve(ctx context.Context, id uuid.UUID) (*model.Session, error)
	Update(ctx context.Context, session *model.Session) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// LLMProvider defines the interface for interacting with LLM providers
type LLMProvider interface {
	GenerateText(ctx context.Context, request *model.Request) (*model.Response, error)
	StreamText(ctx context.Context, request *model.Request) (<-chan struct{}, error)
	VerifyKey(ctx context.Context, credential *model.Credential) error
}
