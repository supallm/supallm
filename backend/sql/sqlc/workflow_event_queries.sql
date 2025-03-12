-- name: storeWorkflowEvent :exec
INSERT INTO workflow_events (id, workflow_id, trigger_id, event_type, data)
VALUES ($1, $2, $3, $4, $5);

-- name: workflowEventsByWorkflowId :many
SELECT *
FROM workflow_events
WHERE workflow_id = $1;

-- name: workflowEventsByTriggerId :many
SELECT *
FROM workflow_events
WHERE trigger_id = $1;