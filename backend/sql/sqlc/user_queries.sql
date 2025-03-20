-- name: createUser :one
INSERT INTO users (
    id,
    email,
    name,
    password_hash
) VALUES (
    $1, $2, $3, $4
) RETURNING *;

-- name: getUserByEmail :one
SELECT * FROM users
WHERE email = $1
LIMIT 1;

-- name: hasUser :one
SELECT EXISTS (
    SELECT 1 FROM users
);

-- name: getUserByID :one
SELECT * FROM users
WHERE id = $1
LIMIT 1;

-- name: updateUser :exec
UPDATE users
SET
    name = COALESCE(sqlc.narg(name), name),
    email = COALESCE(sqlc.narg(email), email),
    password_hash = COALESCE(sqlc.narg(password_hash), password_hash)
WHERE id = $1;