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
	APIKey       secret.ApiKey
}

func (p *Project) CreateCredential(id uuid.UUID, name string, providerType ProviderType, apiKey secret.ApiKey) (*Credential, error) {
	if id == uuid.Nil {
		return nil, errs.ErrReqInvalid{Field: "id", Reason: "id is required"}
	}

	if name == "" {
		return nil, errs.ErrReqInvalid{Field: "name", Reason: "name is required"}
	}

	if providerType == "" {
		return nil, errs.ErrReqInvalid{Field: "providerType", Reason: "providerType is required"}
	}

	if apiKey == "" {
		return nil, errs.ErrReqInvalid{Field: "apiKey", Reason: "apiKey is required"}
	}

	credential := &Credential{ID: id, Name: name, ProviderType: providerType, APIKey: apiKey}
	p.Credentials[credential.ID] = credential
	return credential, nil
}

func (p *Project) GetCredential(id uuid.UUID) (*Credential, error) {
	credential, ok := p.Credentials[id]
	if !ok {
		return nil, ErrCredentialNotFound
	}
	return credential, nil
}

func (p *Project) UpdateCredential(id uuid.UUID, name string, apiKey secret.ApiKey) error {
	credential, err := p.GetCredential(id)
	if err != nil {
		return err
	}

	if name == "" {
		return errs.ErrReqInvalid{Field: "name", Reason: "name is required"}
	}

	if apiKey != "" {
		credential.APIKey = apiKey
	}

	credential.Name = name
	return nil
}
