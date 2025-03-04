-- name: storeLLMProvider :exec
INSERT INTO llm_providers (id, project_id, name, provider_type, api_key_encrypted, api_key_obfuscated)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: upsertLLMProvider :exec
INSERT INTO llm_providers (id, project_id, name, provider_type, api_key_encrypted, api_key_obfuscated)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (id) 
DO UPDATE SET
    name = EXCLUDED.name,
    provider_type = EXCLUDED.provider_type,
    api_key_encrypted = EXCLUDED.api_key_encrypted,
    api_key_obfuscated = EXCLUDED.api_key_obfuscated,
    updated_at = NOW();

-- name: deleteLLMProvider :exec
DELETE FROM llm_providers
WHERE id = $1;

-- name: llmProvidersByProjectId :many
SELECT *
FROM llm_providers
WHERE project_id = $1;