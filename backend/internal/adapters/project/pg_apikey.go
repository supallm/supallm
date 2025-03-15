package project

import (
	"context"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
)

func (r Repository) AddAPIKey(ctx context.Context, projectID uuid.UUID, apiKey *model.APIKey) error {
	err := r.queries.storeAPIKey(ctx, storeAPIKeyParams{
		ID:        apiKey.ID,
		ProjectID: projectID,
		KeyHash:   apiKey.KeyHash,
	})
	if err != nil {
		return r.errorDecoder(err)
	}
	return nil
}

func (r Repository) updateAPIKeys(ctx context.Context, q *Queries, project *model.Project) error {
	for _, apiKey := range project.APIKeys {
		err := q.storeAPIKey(ctx, storeAPIKeyParams{
			ID:        apiKey.ID,
			ProjectID: project.ID,
			KeyHash:   apiKey.KeyHash,
		})
		if err != nil {
			return r.errorDecoder(err)
		}
	}
	return nil
}

func (r Repository) DeleteAPIKey(ctx context.Context, id uuid.UUID) error {
	err := r.queries.deleteAPIKey(ctx, id)
	if err != nil {
		return r.errorDecoder(err)
	}
	return nil
}
