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
		Prompt Prompt
	}

	LLMRequest struct {
		ID     uuid.UUID
		Model  Model
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
		Content     string
		Status      ResponseStatus
		TokenUsage  TokenUsage
		Chunks      []StreamChunk
		StartedAt   time.Time
		CompletedAt *time.Time
	}
)

func (p Prompt) String() string {
	return string(p)
}

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

	if model == nil {
		return nil, ErrInvalidModel
	}

	request := &LLMRequest{
		ID:     id,
		Model:  *model,
		Config: config,
		Status: RequestStatusPending,
	}
	s.Requests = append(s.Requests, request)
	return request, nil
}
