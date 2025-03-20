package user

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/pkg/auth"
	"github.com/supallm/core/internal/pkg/config"
	"github.com/supallm/core/internal/pkg/errs"
)

type repository struct {
	pool *pgxpool.Pool
	q    *Queries
	conf config.Auth
}

func NewRepository(_ context.Context, pool *pgxpool.Pool, conf config.Auth) repository {
	return repository{
		pool: pool,
		q:    New(pool),
		conf: conf,
	}
}

func (r repository) LoadFixtures(ctx context.Context) error {
	hasUser, err := r.q.hasUser(ctx)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}
	if hasUser {
		return nil
	}

	hash, err := auth.HashPassword(r.conf.InitialUser.Password)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	user := &model.User{
		ID:           uuid.New(),
		Email:        r.conf.InitialUser.Email,
		Name:         r.conf.InitialUser.Name,
		PasswordHash: hash,
	}

	err = r.CreateUser(ctx, user)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
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
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errs.NotFoundError{
				Resource: "user",
				Err:      fmt.Errorf("user with email %s not found", email),
			}
		}
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	return mapDBUserToDomain(u), nil
}

func (r repository) GetUserByID(ctx context.Context, id uuid.UUID) (*model.User, error) {
	u, err := r.q.getUserByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errs.NotFoundError{
				Resource: "user",
				Err:      fmt.Errorf("user with id %s not found", id),
			}
		}
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
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
