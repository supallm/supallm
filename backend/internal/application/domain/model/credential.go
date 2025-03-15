package model

import (
	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/errs"
	"github.com/supallm/core/internal/pkg/secret"
)

type Credential struct {
	ID           uuid.UUID
	ProviderType ProviderType
	Name         string
	APIKey       secret.Encrypted
}

func (p *Project) CreateCredential(
	id uuid.UUID,
	name string,
	providerType ProviderType,
	apiKey secret.APIKey,
) (*Credential, error) {
	if id == uuid.Nil {
		return nil, errs.InvalidError{Field: "id", Reason: "id is required"}
	}

	if name == "" {
		return nil, errs.InvalidError{Field: "name", Reason: "name is required"}
	}

	if providerType == "" {
		return nil, errs.InvalidError{Field: "providerType", Reason: "providerType is required"}
	}

	if apiKey == "" {
		return nil, errs.InvalidError{Field: "apiKey", Reason: "apiKey is required"}
	}

	encrypted, err := apiKey.Encrypt()
	if err != nil {
		return nil, err
	}

	credential := &Credential{ID: id, Name: name, ProviderType: providerType, APIKey: encrypted}
	p.Credentials[credential.ID] = credential
	return credential, nil
}

func (p *Project) UpdateCredential(id uuid.UUID, name string, apiKey secret.APIKey) error {
	if name == "" {
		return errs.InvalidError{Field: "name", Reason: "name is required"}
	}

	credential, ok := p.Credentials[id]
	if !ok {
		return ErrCredentialNotFound
	}

	encrypted, err := apiKey.Encrypt()
	if err != nil {
		return err
	}

	credential.Name = name
	credential.APIKey = encrypted

	return nil
}
