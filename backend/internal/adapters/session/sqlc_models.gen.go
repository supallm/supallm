// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.20.0

package session

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type Request struct {
	ID        uuid.UUID          `json:"id"`
	SessionID uuid.UUID          `json:"session_id"`
	ModelID   uuid.UUID          `json:"model_id"`
	Config    []byte             `json:"config"`
	Status    string             `json:"status"`
	CreatedAt pgtype.Timestamptz `json:"created_at"`
	UpdatedAt pgtype.Timestamptz `json:"updated_at"`
}

type Response struct {
	ID          uuid.UUID          `json:"id"`
	RequestID   uuid.UUID          `json:"request_id"`
	SessionID   uuid.UUID          `json:"session_id"`
	Content     string             `json:"content"`
	Status      string             `json:"status"`
	TokenUsage  []byte             `json:"token_usage"`
	StartedAt   pgtype.Timestamptz `json:"started_at"`
	CompletedAt pgtype.Timestamptz `json:"completed_at"`
}

type Session struct {
	ID             uuid.UUID          `json:"id"`
	UserID         string             `json:"user_id"`
	ProjectID      uuid.UUID          `json:"project_id"`
	Active         pgtype.Bool        `json:"active"`
	LastActivityAt pgtype.Timestamptz `json:"last_activity_at"`
	CreatedAt      pgtype.Timestamptz `json:"created_at"`
}
