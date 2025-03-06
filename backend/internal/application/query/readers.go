package query

import (
	"context"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/slug"
)

type ProjectReader interface {
	ReadProject(ctx context.Context, id uuid.UUID) (Project, error)
	ReadCredential(ctx context.Context, projectID uuid.UUID, credentialID uuid.UUID) (Credential, error)
	ReadModel(ctx context.Context, projectID uuid.UUID, modelSlug slug.Slug) (Model, error)
	ListProjects(ctx context.Context, userID string) ([]Project, error)
}
