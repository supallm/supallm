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
	APIKey       secret.APIKey
}

func (p *Project) CreateCredential(
	id uuid.UUID,
	name string,
	providerType ProviderType,
	apiKey secret.APIKey,
) (*Credential, error) {
	if id == uuid.Nil {
		return nil, errs.ReqInvalidError{Field: "id", Reason: "id is required"}
	}

	if name == "" {
		return nil, errs.ReqInvalidError{Field: "name", Reason: "name is required"}
	}

	if providerType == "" {
		return nil, errs.ReqInvalidError{Field: "providerType", Reason: "providerType is required"}
	}

	if apiKey == "" {
		return nil, errs.ReqInvalidError{Field: "apiKey", Reason: "apiKey is required"}
	}

	credential := &Credential{ID: id, Name: name, ProviderType: providerType, APIKey: apiKey}
	p.Credentials[credential.ID] = credential
	return credential, nil
}

func (p *Project) getCredential(id uuid.UUID) (*Credential, error) {
	credential, ok := p.Credentials[id]
	if !ok {
		return nil, ErrCredentialNotFound
	}
	return credential, nil
}

func (p *Project) UpdateCredential(id uuid.UUID, name string, apiKey secret.APIKey) error {
	if name == "" {
		return errs.ReqInvalidError{Field: "name", Reason: "name is required"}
	}

	credential, ok := p.Credentials[id]
	if !ok {
		return ErrCredentialNotFound
	}

	credential.Name = name
	if apiKey != "" {
		credential.APIKey = apiKey
	}

	return nil
}
