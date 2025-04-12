package events

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/event"
)

type RedisEventStore struct {
	client *redis.Client
	ttl    time.Duration
}

func NewRedisEventStore(client *redis.Client, ttl time.Duration) RedisEventStore {
	return RedisEventStore{
		client: client,
		ttl:    ttl,
	}
}

func (s RedisEventStore) StoreEvent(ctx context.Context, event *event.WorkflowEventMessage) ([]byte, error) {
	seqKey := fmt.Sprintf("workflow:%s:%s:sequence", event.WorkflowID, event.TriggerID)
	eventKey := fmt.Sprintf("workflow:%s:%s:events", event.WorkflowID, event.TriggerID)

	sequence, err := s.client.Incr(ctx, seqKey).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to generate sequence: %w", err)
	}
	if sequence <= 0 {
		return nil, fmt.Errorf("invalid sequence number: %d", sequence)
	}
	event.Sequence = uint64(sequence)
	eventJSON, err := json.Marshal(event)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal event: %w", err)
	}

	pipe := s.client.Pipeline()
	pipe.ZAdd(ctx, eventKey, redis.Z{
		Score:  float64(sequence),
		Member: string(eventJSON),
	})
	pipe.Expire(ctx, eventKey, s.ttl)
	pipe.Expire(ctx, seqKey, s.ttl)

	if _, err = pipe.Exec(ctx); err != nil {
		return nil, fmt.Errorf("failed to store event: %w", err)
	}

	return eventJSON, nil
}

func (s RedisEventStore) ReadWorkflowEvents(
	ctx context.Context,
	workflowID model.WorkflowID,
	triggerID uuid.UUID,
	sequence uint64,
) ([]event.WorkflowEventMessage, error) {
	eventKey := fmt.Sprintf("workflow:%s:%s:events", workflowID, triggerID)

	fromSequence := "0"
	if sequence > 0 {
		fromSequence = strconv.FormatUint(sequence, 10)
	}

	//nolint
	events, err := s.client.ZRangeByScore(ctx, eventKey, &redis.ZRangeBy{
		Min: fromSequence,
		Max: "+inf",
	}).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return []event.WorkflowEventMessage{}, nil
		}
		return nil, fmt.Errorf("failed to get events: %w", err)
	}

	result := make([]event.WorkflowEventMessage, 0, len(events))
	for _, eventJSON := range events {
		var event event.WorkflowEventMessage
		if err = json.Unmarshal([]byte(eventJSON), &event); err != nil {
			return nil, fmt.Errorf("failed to unmarshal event: %w", err)
		}
		result = append(result, event)
	}

	return result, nil
}
