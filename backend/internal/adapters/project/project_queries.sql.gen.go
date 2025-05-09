// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.20.0
// source: project_queries.sql

package project

import (
	"context"

	"github.com/google/uuid"
)

const deleteProject = `-- name: deleteProject :exec
DELETE FROM projects
WHERE id = $1
`

func (q *Queries) deleteProject(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.Exec(ctx, deleteProject, id)
	return err
}

const projectById = `-- name: projectById :one
SELECT id, user_id, name, auth_provider, version, created_at, updated_at
FROM projects
WHERE id = $1
`

func (q *Queries) projectById(ctx context.Context, id uuid.UUID) (Project, error) {
	row := q.db.QueryRow(ctx, projectById, id)
	var i Project
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.Name,
		&i.AuthProvider,
		&i.Version,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const projectsByUserId = `-- name: projectsByUserId :many
SELECT id, user_id, name, auth_provider, version, created_at, updated_at
FROM projects
WHERE user_id = $1
`

func (q *Queries) projectsByUserId(ctx context.Context, userID string) ([]Project, error) {
	rows, err := q.db.Query(ctx, projectsByUserId, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Project
	for rows.Next() {
		var i Project
		if err := rows.Scan(
			&i.ID,
			&i.UserID,
			&i.Name,
			&i.AuthProvider,
			&i.Version,
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

const storeProject = `-- name: storeProject :exec
INSERT INTO projects (id, user_id, name)
VALUES ($1, $2, $3)
`

type storeProjectParams struct {
	ID     uuid.UUID `json:"id"`
	UserID string    `json:"user_id"`
	Name   string    `json:"name"`
}

func (q *Queries) storeProject(ctx context.Context, arg storeProjectParams) error {
	_, err := q.db.Exec(ctx, storeProject, arg.ID, arg.UserID, arg.Name)
	return err
}

const updateProject = `-- name: updateProject :exec
UPDATE projects
SET name = $2,
    auth_provider = $3,
    version = version + 1,
    updated_at = NOW()
WHERE id = $1 
  AND version = $4
`

type updateProjectParams struct {
	ID           uuid.UUID    `json:"id"`
	Name         string       `json:"name"`
	AuthProvider authProvider `json:"auth_provider"`
	Version      int64        `json:"version"`
}

func (q *Queries) updateProject(ctx context.Context, arg updateProjectParams) error {
	_, err := q.db.Exec(ctx, updateProject,
		arg.ID,
		arg.Name,
		arg.AuthProvider,
		arg.Version,
	)
	return err
}
