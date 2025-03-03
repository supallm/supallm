package query

import (
	"context"

	"github.com/google/uuid"
)

type ProjectReader interface {
	GetProject(ctx context.Context, id uuid.UUID) (Project, error)
	ListProjects(ctx context.Context, userID uuid.UUID) ([]Project, error)
}
