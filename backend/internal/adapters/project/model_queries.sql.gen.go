// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.20.0
// source: model_queries.sql

package project

import (
	"context"

	"github.com/google/uuid"
)

const deleteModel = `-- name: deleteModel :exec
DELETE FROM models
WHERE id = $1
`

func (q *Queries) deleteModel(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.Exec(ctx, deleteModel, id)
	return err
}

const modelsByProjectId = `-- name: modelsByProjectId :many
SELECT id, project_id, credential_id, name, slug, provider_model, system_prompt, parameters, created_at, updated_at
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
			&i.CredentialID,
			&i.Name,
			&i.Slug,
			&i.ProviderModel,
			&i.SystemPrompt,
			&i.Parameters,
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
INSERT INTO models (id, project_id, credential_id, name, slug, provider_model, system_prompt, parameters)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
`

type storeModelParams struct {
	ID            uuid.UUID       `json:"id"`
	ProjectID     uuid.UUID       `json:"project_id"`
	CredentialID  uuid.UUID       `json:"credential_id"`
	Name          string          `json:"name"`
	Slug          string          `json:"slug"`
	ProviderModel string          `json:"provider_model"`
	SystemPrompt  string          `json:"system_prompt"`
	Parameters    modelParameters `json:"parameters"`
}

func (q *Queries) storeModel(ctx context.Context, arg storeModelParams) error {
	_, err := q.db.Exec(ctx, storeModel,
		arg.ID,
		arg.ProjectID,
		arg.CredentialID,
		arg.Name,
		arg.Slug,
		arg.ProviderModel,
		arg.SystemPrompt,
		arg.Parameters,
	)
	return err
}

const upsertModel = `-- name: upsertModel :exec
INSERT INTO models (id, project_id, credential_id, name, slug, provider_model, system_prompt, parameters)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (id)
DO UPDATE SET
    provider_model = EXCLUDED.provider_model,
    credential_id = EXCLUDED.credential_id,
    name = EXCLUDED.name,
    system_prompt = EXCLUDED.system_prompt,
    parameters = EXCLUDED.parameters,
    updated_at = NOW()
`

type upsertModelParams struct {
	ID            uuid.UUID       `json:"id"`
	ProjectID     uuid.UUID       `json:"project_id"`
	CredentialID  uuid.UUID       `json:"credential_id"`
	Name          string          `json:"name"`
	Slug          string          `json:"slug"`
	ProviderModel string          `json:"provider_model"`
	SystemPrompt  string          `json:"system_prompt"`
	Parameters    modelParameters `json:"parameters"`
}

func (q *Queries) upsertModel(ctx context.Context, arg upsertModelParams) error {
	_, err := q.db.Exec(ctx, upsertModel,
		arg.ID,
		arg.ProjectID,
		arg.CredentialID,
		arg.Name,
		arg.Slug,
		arg.ProviderModel,
		arg.SystemPrompt,
		arg.Parameters,
	)
	return err
}
