-- name: storeStreamChunk :exec
INSERT INTO stream_chunks (id, response_id, index, content, is_last)
VALUES ($1, $2, $3, $4, $5);