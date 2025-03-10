package query

import (
	"context"

	"github.com/google/uuid"
)

type ProjectReader interface {
	ReadProject(ctx context.Context, id uuid.UUID) (Project, error)
	ReadCredential(ctx context.Context, projectID uuid.UUID, credentialID uuid.UUID) (Credential, error)
	ReadWorkflow(ctx context.Context, projectID uuid.UUID, workflowID uuid.UUID) (Workflow, error)
	ListProjects(ctx context.Context, userID string) ([]Project, error)
}
