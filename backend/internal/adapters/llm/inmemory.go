package llm

import (
	"context"

	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/pkg/secret"
)

type InMemory struct{}

func (i *InMemory) GenerateText(_ context.Context, _ *model.Request) (*model.Response, error) {
	return nil, nil
}

func (i *InMemory) StreamText(_ context.Context, _ *model.Request) (<-chan struct{}, error) {
	return nil, nil
}

func (i *InMemory) VerifyKey(_ context.Context, _ secret.APIKey) error {
	return nil
}
