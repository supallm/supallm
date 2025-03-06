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

func (r Repository) Create(_ context.Context, _ *model.Session) error {
	return nil
}

func (r Repository) Retrieve(_ context.Context, _ uuid.UUID) (*model.Session, error) {
	return nil, nil
}

func (r Repository) Update(_ context.Context, _ *model.Session) error {
	return nil
}

func (r Repository) Delete(_ context.Context, _ uuid.UUID) error {
	return nil
}
