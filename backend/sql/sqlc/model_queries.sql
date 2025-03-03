-- name: storeModel :exec
INSERT INTO models (id, project_id, provider_id, slug, llm_model, system_prompt)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: upsertModel :exec
INSERT INTO models (id, project_id, provider_id, slug, llm_model, system_prompt)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (id)
DO UPDATE SET
    llm_model = EXCLUDED.llm_model,
    system_prompt = EXCLUDED.system_prompt,
    provider_id = EXCLUDED.provider_id,
    updated_at = NOW();

-- name: deleteModel :exec
DELETE FROM models
WHERE id = $1;

-- name: modelsByProjectId :many
SELECT *
FROM models
WHERE project_id = $1;

-- name: deleteAllModelsByProjectId :exec
DELETE FROM models
WHERE project_id = $1;
