package user

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	adapterrors "github.com/supallm/core/internal/adapters/errors"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/pkg/auth"
)

type repository struct {
	pool *pgxpool.Pool
	q    *Queries
}

func NewRepository(_ context.Context, pool *pgxpool.Pool) repository {
	return repository{
		pool: pool,
		q:    New(pool),
	}
}

func (r repository) errorDecoder(err error) error {
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

func (r repository) CreateUser(ctx context.Context, u *model.User) error {
	_, err := r.q.createUser(ctx, createUserParams{
		ID:           u.ID,
		Email:        u.Email,
		Name:         u.Name,
		PasswordHash: u.PasswordHash.String(),
	})
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (r repository) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	u, err := r.q.getUserByEmail(ctx, email)
	if err != nil {
		return nil, r.errorDecoder(err)
	}

	return mapDBUserToDomain(u), nil
}

func (r repository) GetUserByID(ctx context.Context, id uuid.UUID) (*model.User, error) {
	u, err := r.q.getUserByID(ctx, id)
	if err != nil {
		return nil, r.errorDecoder(err)
	}

	return mapDBUserToDomain(u), nil
}

func (r repository) ReadUser(ctx context.Context, email string) (query.User, error) {
	u, err := r.q.getUserByEmail(ctx, email)
	if err != nil {
		return query.User{}, fmt.Errorf("failed to get user by email: %w", err)
	}

	return mapDBUserToQuery(u), nil
}

func mapDBUserToDomain(u User) *model.User {
	return &model.User{
		ID:           u.ID,
		Email:        u.Email,
		Name:         u.Name,
		PasswordHash: auth.Hash(u.PasswordHash),
	}
}

func mapDBUserToQuery(u User) query.User {
	return query.User{
		ID:        u.ID,
		Email:     u.Email,
		Name:      u.Name,
		CreatedAt: u.CreatedAt.Time,
		UpdatedAt: u.UpdatedAt.Time,
	}
}
