-- name: storeResponse :exec
INSERT INTO responses (id, request_id, session_id, content, status, token_usage)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: responseById :one
SELECT *
FROM responses
WHERE id = $1;

-- name: responseByRequestId :one
SELECT *
FROM responses
WHERE request_id = $1;

-- name: responsesBySessionId :many
SELECT *
FROM responses
WHERE session_id = $1
ORDER BY started_at DESC;