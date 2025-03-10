package model

import (
	"time"

	"github.com/google/uuid"
)

type (
	Session struct {
		ID             uuid.UUID
		UserID         string
		ProjectID      uuid.UUID
		Requests       []*Request
		Responses      []*Response
		Active         bool
		LastActivityAt time.Time
	}

	Prompt         string
	RequestStatus  string
	ResponseStatus string

	RequestConfig struct {
		Prompt Prompt
	}

	Request struct {
		ID       uuid.UUID
		Workflow *Workflow
		Status   RequestStatus
		Config   RequestConfig
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

	Response struct {
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

func NewSession(id uuid.UUID, userID string, projectID uuid.UUID) *Session {
	return &Session{
		ID:             id,
		UserID:         userID,
		ProjectID:      projectID,
		Requests:       make([]*Request, 0),
		Responses:      make([]*Response, 0),
		Active:         true,
		LastActivityAt: time.Now(),
	}
}

func (s *Session) AddResponse(response *Response) {
	s.Responses = append(s.Responses, response)
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

func (s *Session) NewRequest(id uuid.UUID, workflow *Workflow, config RequestConfig) (*Request, error) {
	if id == uuid.Nil {
		return nil, ErrInvalidID
	}

	if workflow == nil {
		return nil, ErrInvalidWorkflow
	}

	request := &Request{
		ID:       id,
		Workflow: workflow,
		Config:   config,
		Status:   RequestStatusPending,
	}
	s.Requests = append(s.Requests, request)
	return request, nil
}
