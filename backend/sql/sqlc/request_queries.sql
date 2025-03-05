-- name: storeRequest :exec
INSERT INTO requests (id, session_id, model_id, config, status)
VALUES ($1, $2, $3, $4, $5);

-- name: requestById :one
SELECT *
FROM requests
WHERE id = $1;

-- name: updateRequestStatus :exec
UPDATE requests
SET status = $2,
    updated_at = NOW()
WHERE id = $1;

-- name: requestsBySessionId :many
SELECT *
FROM requests
WHERE session_id = $1
ORDER BY created_at DESC;
