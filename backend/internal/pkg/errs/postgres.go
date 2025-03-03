package errs

import (
	"errors"
	"fmt"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgx"
)

func ErrorDecoder(err error) error {
	if err == nil {
		return nil
	}

	if errors.Is(err, pgx.ErrNoRows) {
		return fmt.Errorf("%w: %w", ErrNotFound{
			Resource: "session",
			ID:       "",
		}, err)
	}

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case "23505", "23514":
			return fmt.Errorf("%w: %w", ErrDuplicate{
				Resource: "session",
				ID:       "",
			}, err)
		case "23503", "23502", "22P02", "42P01", "42703":
			return fmt.Errorf("%w: %w", ErrReqInvalid{
				Field:  "session",
				Reason: pgErr.Message,
			}, err)
		}
	}

	if errors.Is(err, pgx.ErrTxCommitRollback) || errors.Is(err, pgx.ErrTxClosed) {
		return ErrInternal{
			Reason: err,
		}
	}

	return fmt.Errorf("%w: %w", ErrInternal{
		Reason: err,
	}, err)
}
