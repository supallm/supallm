package model

import (
	"time"

	"github.com/google/uuid"
)

type LLMSession struct {
	ID             uuid.UUID
	UserID         string
	ProjectID      uuid.UUID
	Requests       []*LLMRequest
	Responses      []*LLMResponse
	Active         bool
	LastActivityAt time.Time
}

func NewLLMSession(id uuid.UUID, userID string, projectID uuid.UUID) *LLMSession {
	return &LLMSession{
		ID:        id,
		UserID:    userID,
		ProjectID: projectID,
		Requests:  make([]*LLMRequest, 0),
		Responses: make([]*LLMResponse, 0),
		Active:    true,
	}
}

func (s *LLMSession) AddResponse(response *LLMResponse) {
	s.Responses = append(s.Responses, response)
}
