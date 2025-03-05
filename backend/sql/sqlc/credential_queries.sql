-- name: storeCredential :exec
INSERT INTO credentials (id, project_id, name, provider_type, api_key_encrypted, api_key_obfuscated)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: upsertCredential :exec
INSERT INTO credentials (id, project_id, name, provider_type, api_key_encrypted, api_key_obfuscated)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (id) 
DO UPDATE SET
    name = EXCLUDED.name,
    provider_type = EXCLUDED.provider_type,
    api_key_encrypted = EXCLUDED.api_key_encrypted,
    api_key_obfuscated = EXCLUDED.api_key_obfuscated,
    updated_at = NOW();

-- name: deleteCredential :exec
DELETE FROM credentials
WHERE id = $1;

-- name: credentialsByProjectId :many
SELECT *
FROM credentials
WHERE project_id = $1;