package model

import (
	"time"

	"github.com/google/uuid"
)

type (
	Prompt         string
	RequestStatus  string
	ResponseStatus string

	LLMRequestConfig struct {
		MaxTokens   int
		Temperature float64
		Prompt      Prompt
	}

	LLMRequest struct {
		ID     uuid.UUID
		Model  *Model
		Status RequestStatus
		Config LLMRequestConfig
	}

	TokenUsage struct {
		PromptTokens     int
		CompletionTokens int
		TotalTokens      int
		Cost             float64
	}

	StreamChunk struct {
		ID        uuid.UUID
		Index     int
		Content   string
		IsLast    bool
		Timestamp time.Time
		Delivered bool
	}

	LLMResponse struct {
		ID          uuid.UUID
		RequestID   uuid.UUID
		SessionID   uuid.UUID
		Content     string
		Status      ResponseStatus
		TokenUsage  TokenUsage
		Chunks      []StreamChunk
		StartedAt   time.Time
		CompletedAt *time.Time
	}
)

const (
	RequestStatusPending   RequestStatus = "pending"
	RequestStatusCompleted RequestStatus = "completed"
	RequestStatusFailed    RequestStatus = "failed"

	ResponseStatusPending     ResponseStatus = "pending"
	ResponseStatusStreaming   ResponseStatus = "streaming"
	ResponseStatusCompleted   ResponseStatus = "completed"
	ResponseStatusFailed      ResponseStatus = "failed"
	ResponseStatusInterrupted ResponseStatus = "interrupted"
)

func (s *LLMSession) NewRequest(id uuid.UUID, model *Model, config LLMRequestConfig) (*LLMRequest, error) {
	if id == uuid.Nil {
		return nil, ErrInvalidID
	}

	request := &LLMRequest{
		ID:     id,
		Model:  model,
		Config: config,
		Status: RequestStatusPending,
	}
	s.Requests = append(s.Requests, request)

	return request, nil
}
