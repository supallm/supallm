package project

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/query"
)

type Repository struct {
	queries *Queries
	pool    *pgxpool.Pool
}

func NewRepository(_ context.Context, pool *pgxpool.Pool) *Repository {
	return &Repository{
		queries: New(pool),
		pool:    pool,
	}
}

func (r Repository) Create(ctx context.Context, project *model.Project) error {
	return nil
}

func (r Repository) Retrieve(ctx context.Context, id uuid.UUID) (*model.Project, error) {
	return nil, nil
}

func (r Repository) Update(ctx context.Context, project *model.Project) error {
	return nil
}

func (r Repository) Delete(ctx context.Context, id uuid.UUID) error {
	return nil
}

func (r Repository) GetProject(ctx context.Context, id uuid.UUID) (query.Project, error) {
	return query.Project{}, nil
}

func (r Repository) ListProjects(ctx context.Context, userID uuid.UUID) ([]query.Project, error) {
	return nil, nil
}
