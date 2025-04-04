-- name: storeWorkflow :exec
INSERT INTO workflows (id, project_id, name, status, builder_flow, runner_flow)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: upsertWorkflow :exec
INSERT INTO workflows (id, project_id, name, status, builder_flow, runner_flow)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    builder_flow = EXCLUDED.builder_flow,
    runner_flow = EXCLUDED.runner_flow,
    updated_at = NOW();

-- name: deleteWorkflow :exec
DELETE FROM workflows
WHERE id = $1;

-- name: workflowsByProjectId :many
SELECT *
FROM workflows
WHERE project_id = $1;

-- name: workflowById :one
SELECT *
FROM workflows
WHERE id = $1;
