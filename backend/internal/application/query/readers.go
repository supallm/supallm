package query

import (
	"context"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
)

type ProjectReader interface {
	ReadProject(ctx context.Context, id uuid.UUID) (Project, error)
	ReadCredential(ctx context.Context, projectID uuid.UUID, credentialID uuid.UUID) (Credential, error)
	ReadWorkflow(ctx context.Context, projectID uuid.UUID, workflowID model.WorkflowID) (Workflow, error)
	ListProjects(ctx context.Context, userID string) ([]Project, error)
}

type UserReader interface {
	ReadUser(ctx context.Context, email string) (User, error)
}

type ExecutionReader interface {
	ReadWorkflowExecutions(ctx context.Context, workflowID string) ([]Execution, error)
	ReadTriggerExecution(ctx context.Context, workflowID string, triggerID uuid.UUID) (Execution, error)
}
