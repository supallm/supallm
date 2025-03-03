// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.20.0
// source: model_queries.sql

package project

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

const deleteAllModelsByProjectId = `-- name: deleteAllModelsByProjectId :exec
DELETE FROM models
WHERE project_id = $1
`

func (q *Queries) deleteAllModelsByProjectId(ctx context.Context, projectID uuid.UUID) error {
	_, err := q.db.Exec(ctx, deleteAllModelsByProjectId, projectID)
	return err
}

const deleteModel = `-- name: deleteModel :exec
DELETE FROM models
WHERE id = $1
`

func (q *Queries) deleteModel(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.Exec(ctx, deleteModel, id)
	return err
}

const modelsByProjectId = `-- name: modelsByProjectId :many
SELECT id, project_id, provider_id, slug, llm_model, system_prompt, created_at, updated_at
FROM models
WHERE project_id = $1
`

func (q *Queries) modelsByProjectId(ctx context.Context, projectID uuid.UUID) ([]Model, error) {
	rows, err := q.db.Query(ctx, modelsByProjectId, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Model
	for rows.Next() {
		var i Model
		if err := rows.Scan(
			&i.ID,
			&i.ProjectID,
			&i.ProviderID,
			&i.Slug,
			&i.LlmModel,
			&i.SystemPrompt,
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

const storeModel = `-- name: storeModel :exec
INSERT INTO models (id, project_id, provider_id, slug, llm_model, system_prompt)
VALUES ($1, $2, $3, $4, $5, $6)
`

type storeModelParams struct {
	ID           uuid.UUID   `json:"id"`
	ProjectID    uuid.UUID   `json:"project_id"`
	ProviderID   uuid.UUID   `json:"provider_id"`
	Slug         string      `json:"slug"`
	LlmModel     string      `json:"llm_model"`
	SystemPrompt pgtype.Text `json:"system_prompt"`
}

func (q *Queries) storeModel(ctx context.Context, arg storeModelParams) error {
	_, err := q.db.Exec(ctx, storeModel,
		arg.ID,
		arg.ProjectID,
		arg.ProviderID,
		arg.Slug,
		arg.LlmModel,
		arg.SystemPrompt,
	)
	return err
}

const upsertModel = `-- name: upsertModel :exec
INSERT INTO models (id, project_id, provider_id, slug, llm_model, system_prompt)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (id)
DO UPDATE SET
    llm_model = EXCLUDED.llm_model,
    system_prompt = EXCLUDED.system_prompt,
    provider_id = EXCLUDED.provider_id,
    updated_at = NOW()
`

type upsertModelParams struct {
	ID           uuid.UUID   `json:"id"`
	ProjectID    uuid.UUID   `json:"project_id"`
	ProviderID   uuid.UUID   `json:"provider_id"`
	Slug         string      `json:"slug"`
	LlmModel     string      `json:"llm_model"`
	SystemPrompt pgtype.Text `json:"system_prompt"`
}

func (q *Queries) upsertModel(ctx context.Context, arg upsertModelParams) error {
	_, err := q.db.Exec(ctx, upsertModel,
		arg.ID,
		arg.ProjectID,
		arg.ProviderID,
		arg.Slug,
		arg.LlmModel,
		arg.SystemPrompt,
	)
	return err
}
