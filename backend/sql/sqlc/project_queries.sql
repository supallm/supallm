-- name: storeProject :exec
INSERT INTO projects (id, user_id, name)
VALUES ($1, $2, $3);

-- name: updateProject :exec
UPDATE projects
SET name = $2,
    auth_provider = $3,
    version = version + 1,
    updated_at = NOW()
WHERE id = $1 
  AND version = $4;

-- name: projectById :one
SELECT *
FROM projects
WHERE id = $1;

-- name: projectsByUserId :many
SELECT *
FROM projects
WHERE user_id = $1;

-- name: deleteProject :exec
DELETE FROM projects
WHERE id = $1;
