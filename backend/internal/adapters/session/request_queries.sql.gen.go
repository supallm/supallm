// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.20.0
// source: request_queries.sql

package session

import (
	"context"

	"github.com/google/uuid"
)

const requestById = `-- name: requestById :one
SELECT id, session_id, workflow_id, config, status, created_at, updated_at
FROM requests
WHERE id = $1
`

func (q *Queries) requestById(ctx context.Context, id uuid.UUID) (Request, error) {
	row := q.db.QueryRow(ctx, requestById, id)
	var i Request
	err := row.Scan(
		&i.ID,
		&i.SessionID,
		&i.WorkflowID,
		&i.Config,
		&i.Status,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const requestsBySessionId = `-- name: requestsBySessionId :many
SELECT id, session_id, workflow_id, config, status, created_at, updated_at
FROM requests
WHERE session_id = $1
ORDER BY created_at DESC
`

func (q *Queries) requestsBySessionId(ctx context.Context, sessionID uuid.UUID) ([]Request, error) {
	rows, err := q.db.Query(ctx, requestsBySessionId, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Request
	for rows.Next() {
		var i Request
		if err := rows.Scan(
			&i.ID,
			&i.SessionID,
			&i.WorkflowID,
			&i.Config,
			&i.Status,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const storeRequest = `-- name: storeRequest :exec
INSERT INTO requests (id, session_id, workflow_id, config, status)
VALUES ($1, $2, $3, $4, $5)
`

type storeRequestParams struct {
	ID         uuid.UUID `json:"id"`
	SessionID  uuid.UUID `json:"session_id"`
	WorkflowID uuid.UUID `json:"workflow_id"`
	Config     []byte    `json:"config"`
	Status     string    `json:"status"`
}

func (q *Queries) storeRequest(ctx context.Context, arg storeRequestParams) error {
	_, err := q.db.Exec(ctx, storeRequest,
		arg.ID,
		arg.SessionID,
		arg.WorkflowID,
		arg.Config,
		arg.Status,
	)
	return err
}

const updateRequestStatus = `-- name: updateRequestStatus :exec
UPDATE requests
SET status = $2,
    updated_at = NOW()
WHERE id = $1
`

type updateRequestStatusParams struct {
	ID     uuid.UUID `json:"id"`
	Status string    `json:"status"`
}

func (q *Queries) updateRequestStatus(ctx context.Context, arg updateRequestStatusParams) error {
	_, err := q.db.Exec(ctx, updateRequestStatus, arg.ID, arg.Status)
	return err
}
