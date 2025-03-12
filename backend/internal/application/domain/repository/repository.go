package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
)

// ProjectRepository defines the interface for project persistence.
type ProjectRepository interface {
	Create(ctx context.Context, project *model.Project) error
	Retrieve(ctx context.Context, id uuid.UUID) (*model.Project, error)
	Update(ctx context.Context, project *model.Project) error

	DeleteProject(ctx context.Context, id uuid.UUID) error
	DeleteCredential(ctx context.Context, id uuid.UUID) error
	DeleteWorkflow(ctx context.Context, id uuid.UUID) error
}

// WorkflowEventRepository defines the interface for workflow event persistence.
type WorkflowEventRepository interface {
	Create(ctx context.Context, workflowEvent *model.WorkflowEvent) error
	Retrieve(ctx context.Context, id uuid.UUID) (*model.WorkflowEvent, error)
}
