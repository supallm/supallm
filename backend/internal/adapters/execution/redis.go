package execution

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	adapterrors "github.com/supallm/core/internal/adapters/errors"
	"github.com/supallm/core/internal/application/query"
)

type RedisExecutionRepository struct {
	redis *redis.Client
}

func NewRedisExecutionRepository(redis *redis.Client) *RedisExecutionRepository {
	return &RedisExecutionRepository{redis: redis}
}

func (r *RedisExecutionRepository) ReadWorkflowExecutions(
	ctx context.Context,
	workflowID string,
) ([]query.Execution, error) {
	pattern := fmt.Sprintf("workflow:context:%s:*", workflowID)
	iter := r.redis.Scan(ctx, 0, pattern, 0).Iterator()

	var executions []query.Execution
	for iter.Next(ctx) {
		key := iter.Val()
		data, err := r.redis.Get(ctx, key).Bytes()
		if err != nil {
			if errors.Is(err, redis.Nil) {
				continue
			}
			return nil, fmt.Errorf("%w: %w", adapterrors.ErrInternal, err)
		}

		var execution Execution
		if err = json.Unmarshal(data, &execution); err != nil {
			return nil, fmt.Errorf("%w: %w", adapterrors.ErrUnmarshal, err)
		}

		executions = append(executions, toQueryExecution(execution))
	}

	if err := iter.Err(); err != nil {
		return nil, fmt.Errorf("%w: %w", adapterrors.ErrInternal, err)
	}

	return executions, nil
}

func (r *RedisExecutionRepository) ReadTriggerExecution(
	ctx context.Context,
	workflowID string,
	triggerID uuid.UUID,
) (query.Execution, error) {
	key := fmt.Sprintf("workflow:context:%s:%s", workflowID, triggerID)
	data, err := r.redis.Get(ctx, key).Bytes()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return query.Execution{}, fmt.Errorf("%w: %w", adapterrors.ErrNotFound, err)
		}
		return query.Execution{}, fmt.Errorf("%w: %w", adapterrors.ErrInternal, err)
	}

	var execution Execution
	if err = json.Unmarshal(data, &execution); err != nil {
		return query.Execution{}, fmt.Errorf("%w: %w", adapterrors.ErrUnmarshal, err)
	}

	return toQueryExecution(execution), nil
}

func toQueryExecution(e Execution) query.Execution {
	return query.Execution{
		WorkflowID: e.WorkflowID,
		SessionID:  e.SessionID,
		TriggerID:  e.TriggerID,
		WorkflowInputs: query.WorkflowInputs{
			Prompt: e.WorkflowInputs.Prompt,
		},
		NodeExecutions: toQueryNodeExecutions(e.NodeExecutions),
		CompletedNodes: e.CompletedNodes,
		AllNodes:       e.AllNodes,
	}
}

func toQueryNodeExecutions(ne map[string]NodeExecution) map[string]query.NodeExecution {
	result := make(map[string]query.NodeExecution)
	for k, v := range ne {
		result[k] = query.NodeExecution{
			ID:            v.ID,
			Success:       v.Success,
			Inputs:        v.Inputs,
			Output:        v.Output,
			ExecutionTime: v.ExecutionTime,
		}
	}
	return result
}
