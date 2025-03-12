package workflowevent

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
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

// func (r Repository) withTx(ctx context.Context, fn func(*Queries) error) error {
// 	tx, err := r.pool.Begin(ctx)
// 	if err != nil {
// 		return r.errorDecoder(err)
// 	}

// 	isCommitted := false
// 	defer func() {
// 		if !isCommitted {
// 			if err = tx.Rollback(ctx); err != nil {
// 				slog.Error("error rolling back transaction", "error", err)
// 			}
// 		}
// 	}()

// 	q := New(tx)
// 	if err = fn(q); err != nil {
// 		return err
// 	}

// 	if err = tx.Commit(ctx); err != nil {
// 		return r.errorDecoder(err)
// 	}
// 	isCommitted = true

// 	return nil
// }
