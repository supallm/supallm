-- name: storeModel :exec
INSERT INTO models (id, project_id, credential_id, name, slug, llm_model, system_prompt, parameters)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8);

-- name: upsertModel :exec
INSERT INTO models (id, project_id, credential_id, name, slug, llm_model, system_prompt, parameters)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (id)
DO UPDATE SET
    llm_model = EXCLUDED.llm_model,
    credential_id = EXCLUDED.credential_id,
    name = EXCLUDED.name,
    system_prompt = EXCLUDED.system_prompt,
    parameters = EXCLUDED.parameters,
    updated_at = NOW();

-- name: deleteModel :exec
DELETE FROM models
WHERE id = $1;

-- name: modelsByProjectId :many
SELECT *
FROM models
WHERE project_id = $1;