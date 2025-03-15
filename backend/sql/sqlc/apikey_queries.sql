-- name: storeAPIKey :exec
INSERT INTO api_keys (id, project_id, key_hash)
VALUES ($1, $2, $3);

-- name: deleteAPIKey :exec
DELETE FROM api_keys
WHERE id = $1;

-- name: apiKeysByProjectId :many
SELECT *
FROM api_keys
WHERE project_id = $1;
