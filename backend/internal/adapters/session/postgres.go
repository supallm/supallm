package session

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/supallm/core/internal/application/domain/model"
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

func (r Repository) Create(ctx context.Context, session *model.Session) error {
	return nil
}

func (r Repository) Retrieve(ctx context.Context, id uuid.UUID) (*model.Session, error) {
	return nil, nil
}

func (r Repository) Update(ctx context.Context, session *model.Session) error {
	return nil
}

func (r Repository) Delete(ctx context.Context, id uuid.UUID) error {
	return nil
}
