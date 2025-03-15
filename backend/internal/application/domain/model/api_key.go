package model

import (
	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/secret"
)

type APIKey struct {
	ID      uuid.UUID
	KeyHash secret.Encrypted
}

func (p *Project) addAPIKey() error {
	_, encrypted, err := secret.GenerateAPIKey()
	if err != nil {
		return err
	}

	p.APIKeys = append(p.APIKeys, &APIKey{
		ID:      uuid.New(),
		KeyHash: encrypted,
	})

	return nil
}
