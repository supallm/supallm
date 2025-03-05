-- name: storeLLMCredential :exec
INSERT INTO llm_credentials (id, project_id, name, provider_type, api_key_encrypted, api_key_obfuscated)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: upsertLLMCredential :exec
INSERT INTO llm_credentials (id, project_id, name, provider_type, api_key_encrypted, api_key_obfuscated)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (id) 
DO UPDATE SET
    name = EXCLUDED.name,
    provider_type = EXCLUDED.provider_type,
    api_key_encrypted = EXCLUDED.api_key_encrypted,
    api_key_obfuscated = EXCLUDED.api_key_obfuscated,
    updated_at = NOW();

-- name: deleteLLMCredential :exec
DELETE FROM llm_credentials
WHERE id = $1;

-- name: llmCredentialsByProjectId :many
SELECT *
FROM llm_credentials
WHERE project_id = $1;