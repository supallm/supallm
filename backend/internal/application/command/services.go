package command

import (
	"context"

	"github.com/supallm/core/internal/application/domain/model"
)

// LLMService defines the interface for interacting with LLM providers
type LLMService interface {
	GenerateText(ctx context.Context, request *model.LLMRequest) (*model.LLMResponse, error)
	StreamText(ctx context.Context, request *model.LLMRequest) (<-chan struct{}, error)
}

// AuthService defines the interface for authentication operations
type AuthService interface {
	ValidateToken(ctx context.Context, token string) error
}
