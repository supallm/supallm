package project

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/query"
)

func (r Repository) AddCredential(ctx context.Context, projectID uuid.UUID, credential *model.Credential) error {
	encrypted, err := credential.APIKey.Encrypt()
	if err != nil {
		return fmt.Errorf("unable to encrypt api key: %w", err)
	}
	err = r.queries.storeCredential(ctx, storeCredentialParams{
		ID:               credential.ID,
		ProjectID:        projectID,
		Name:             credential.Name,
		ProviderType:     credential.ProviderType.String(),
		ApiKeyEncrypted:  encrypted,
		ApiKeyObfuscated: credential.APIKey.Obfuscate(),
	})
	if err != nil {
		return r.errorDecoder(err)
	}
	return nil
}

func (r Repository) updateCredentials(ctx context.Context, q *Queries, project *model.Project) error {
	for id, llmCredential := range project.Credentials {
		if llmCredential == nil {
			continue
		}

		encrypted, err := llmCredential.APIKey.Encrypt()
		if err != nil {
			return fmt.Errorf("unable to encrypt api key: %w", err)
		}

		err = q.upsertCredential(ctx, upsertCredentialParams{
			ID:               id,
			ProjectID:        project.ID,
			Name:             llmCredential.Name,
			ProviderType:     llmCredential.ProviderType.String(),
			ApiKeyEncrypted:  encrypted,
			ApiKeyObfuscated: llmCredential.APIKey.Obfuscate(),
		})
		if err != nil {
			return r.errorDecoder(err)
		}
	}
	return nil
}

func (r Repository) DeleteCredential(ctx context.Context, id uuid.UUID) error {
	err := r.queries.deleteCredential(ctx, id)
	if err != nil {
		return r.errorDecoder(err)
	}
	return nil
}

func (r Repository) ReadCredential(
	ctx context.Context,
	projectID uuid.UUID,
	credentialID uuid.UUID,
) (query.Credential, error) {
	credential, err := r.queries.credentialById(ctx, credentialID)
	if err != nil {
		return query.Credential{}, r.errorDecoder(err)
	}
	return credential.query(), nil
}
