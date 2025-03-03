-- name: storeSession :exec
INSERT INTO sessions (id, user_id, project_id, active)
VALUES ($1, $2, $3, $4);

-- name: sessionById :one
SELECT *
FROM sessions
WHERE id = $1;

-- name: updateSession :exec
UPDATE sessions
SET active = $2,
    last_activity_at = NOW()
WHERE id = $1;

-- name: sessionsByProjectId :many
SELECT *
FROM sessions
WHERE project_id = $1
ORDER BY last_activity_at DESC;

-- name: sessionsByUserId :many
SELECT *
FROM sessions
WHERE user_id = $1
ORDER BY last_activity_at DESC;

-- name: activeSessions :many
SELECT *
FROM sessions
WHERE active = true
ORDER BY last_activity_at DESC
LIMIT $1; 