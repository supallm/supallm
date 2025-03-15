package project

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	adapterrors "github.com/supallm/core/internal/adapters/errors"
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

func (r Repository) withTx(ctx context.Context, fn func(*Queries) error) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return r.errorDecoder(err)
	}

	isCommitted := false
	defer func() {
		if !isCommitted {
			if err = tx.Rollback(ctx); err != nil {
				slog.Error("error rolling back transaction", "error", err)
			}
		}
	}()

	q := New(tx)
	if err = fn(q); err != nil {
		return err
	}

	if err = tx.Commit(ctx); err != nil {
		return r.errorDecoder(err)
	}
	isCommitted = true

	return nil
}

func (r Repository) errorDecoder(err error) error {
	if err == nil {
		return nil
	}

	if errors.Is(err, pgx.ErrNoRows) {
		return fmt.Errorf("%w: %v", adapterrors.ErrNotFound, err.Error())
	}

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case "23505", "23514":
			return fmt.Errorf("%w: %v", adapterrors.ErrDuplicate, err.Error())
		case "23503", "23502", "22P02", "42P01", "42703":
			return fmt.Errorf("%w: %v", adapterrors.ErrInvalid, err.Error())
		case "P0002":
			return fmt.Errorf("%w: %v", adapterrors.ErrConflict, err.Error())
		}
	}

	return err
}

func (r Repository) retrieveDependencies(
	ctx context.Context,
	projectID uuid.UUID,
) ([]Credential, []Workflow, []ApiKey, error) {
	llmCredentials, err := r.queries.credentialsByProjectId(ctx, projectID)
	if err != nil {
		slog.Error("error retrieving llm credentials", "error", err)
		return nil, nil, nil, r.errorDecoder(err)
	}

	workflows, err := r.queries.workflowsByProjectId(ctx, projectID)
	if err != nil {
		slog.Error("error retrieving workflows", "error", err)
		return nil, nil, nil, r.errorDecoder(err)
	}

	apiKeys, err := r.queries.apiKeysByProjectId(ctx, projectID)
	if err != nil {
		slog.Error("error retrieving api keys", "error", err)
		return nil, nil, nil, r.errorDecoder(err)
	}

	return llmCredentials, workflows, apiKeys, nil
}

func (r Repository) retrieve(
	ctx context.Context,
	projectID uuid.UUID,
) (Project, []Credential, []Workflow, []ApiKey, error) {
	project, err := r.queries.projectById(ctx, projectID)
	if err != nil {
		slog.Error("error retrieving project", "error", err)
		return Project{}, nil, nil, nil, r.errorDecoder(err)
	}

	llmCredentials, workflows, apiKeys, err := r.retrieveDependencies(ctx, projectID)
	if err != nil {
		slog.Error("error retrieving dependencies", "error", err)
		return Project{}, nil, nil, nil, r.errorDecoder(err)
	}

	return project, llmCredentials, workflows, apiKeys, nil
}
