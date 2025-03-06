package project

import (
	"errors"
	"fmt"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgx"
)

type RepoError string

func (e RepoError) Error() string {
	return string(e)
}

const (
	//nolint:gosec
	ErrCredentialNotFound RepoError = "credential not found"
	ErrProjectNotFound    RepoError = "project not found"
	ErrProjectExists      RepoError = "project already exists"
	ErrProjectInvalid     RepoError = "project invalid"
)

func (r Repository) errorDecoder(err error) error {
	if err == nil {
		return nil
	}

	if errors.Is(err, pgx.ErrNoRows) {
		return fmt.Errorf("%w: %w", ErrProjectNotFound, err)
	}

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case "23505", "23514":
			return fmt.Errorf("%w: %w", ErrProjectExists, err)
		case "23503", "23502", "22P02", "42P01", "42703":
			return fmt.Errorf("%w: %w", ErrProjectInvalid, err)
		}
	}

	return err
}
