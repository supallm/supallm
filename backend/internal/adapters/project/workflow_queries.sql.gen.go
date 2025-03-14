// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.20.0
// source: workflow_queries.sql

package project

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
)

const deleteWorkflow = `-- name: deleteWorkflow :exec
DELETE FROM workflows
WHERE id = $1
`

func (q *Queries) deleteWorkflow(ctx context.Context, id string) error {
	_, err := q.db.Exec(ctx, deleteWorkflow, id)
	return err
}

const storeWorkflow = `-- name: storeWorkflow :exec
INSERT INTO workflows (id, project_id, name, status, builder_flow, runner_flow)
VALUES ($1, $2, $3, $4, $5, $6)
`

type storeWorkflowParams struct {
	ID          string          `json:"id"`
	ProjectID   uuid.UUID       `json:"project_id"`
	Name        string          `json:"name"`
	Status      string          `json:"status"`
	BuilderFlow json.RawMessage `json:"builder_flow"`
	RunnerFlow  json.RawMessage `json:"runner_flow"`
}

func (q *Queries) storeWorkflow(ctx context.Context, arg storeWorkflowParams) error {
	_, err := q.db.Exec(ctx, storeWorkflow,
		arg.ID,
		arg.ProjectID,
		arg.Name,
		arg.Status,
		arg.BuilderFlow,
		arg.RunnerFlow,
	)
	return err
}

const upsertWorkflow = `-- name: upsertWorkflow :exec
INSERT INTO workflows (id, project_id, name, status, builder_flow, runner_flow)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    builder_flow = EXCLUDED.builder_flow,
    runner_flow = EXCLUDED.runner_flow,
    updated_at = NOW()
`

type upsertWorkflowParams struct {
	ID          string          `json:"id"`
	ProjectID   uuid.UUID       `json:"project_id"`
	Name        string          `json:"name"`
	Status      string          `json:"status"`
	BuilderFlow json.RawMessage `json:"builder_flow"`
	RunnerFlow  json.RawMessage `json:"runner_flow"`
}

func (q *Queries) upsertWorkflow(ctx context.Context, arg upsertWorkflowParams) error {
	_, err := q.db.Exec(ctx, upsertWorkflow,
		arg.ID,
		arg.ProjectID,
		arg.Name,
		arg.Status,
		arg.BuilderFlow,
		arg.RunnerFlow,
	)
	return err
}

const workflowById = `-- name: workflowById :one
SELECT id, project_id, name, status, builder_flow, runner_flow, created_at, updated_at
FROM workflows
WHERE id = $1
`

func (q *Queries) workflowById(ctx context.Context, id string) (Workflow, error) {
	row := q.db.QueryRow(ctx, workflowById, id)
	var i Workflow
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.Name,
		&i.Status,
		&i.BuilderFlow,
		&i.RunnerFlow,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const workflowsByProjectId = `-- name: workflowsByProjectId :many
SELECT id, project_id, name, status, builder_flow, runner_flow, created_at, updated_at
FROM workflows
WHERE project_id = $1
`

func (q *Queries) workflowsByProjectId(ctx context.Context, projectID uuid.UUID) ([]Workflow, error) {
	rows, err := q.db.Query(ctx, workflowsByProjectId, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Workflow
	for rows.Next() {
		var i Workflow
		if err := rows.Scan(
			&i.ID,
			&i.ProjectID,
			&i.Name,
			&i.Status,
			&i.BuilderFlow,
			&i.RunnerFlow,
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
