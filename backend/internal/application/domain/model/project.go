package model

import (
	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/errs"
	"github.com/supallm/core/internal/pkg/slug"
)

type Project struct {
	ID           uuid.UUID
	UserID       string
	Name         string
	AuthProvider AuthProvider
	Credentials  map[uuid.UUID]*Credential
	Models       map[slug.Slug]*Model
}

func NewProject(id uuid.UUID, userID string, name string) (*Project, error) {
	if id == uuid.Nil {
		return nil, errs.ReqInvalidError{Field: "id", Reason: "id is required"}
	}

	if userID == "" {
		return nil, errs.ReqInvalidError{Field: "userID", Reason: "userID is required"}
	}

	if name == "" {
		return nil, errs.ReqInvalidError{Field: "name", Reason: "name is required"}
	}

	return &Project{
		ID:           id,
		UserID:       userID,
		Name:         name,
		AuthProvider: nil,
		Credentials:  map[uuid.UUID]*Credential{},
		Models:       map[slug.Slug]*Model{},
	}, nil
}

func (p *Project) UpdateName(name string) error {
	if name == "" {
		return errs.ReqInvalidError{Field: "name", Reason: "name is required"}
	}

	p.Name = name
	return nil
}

func (p *Project) UpdateAuthProvider(authProvider AuthProvider) error {
	if authProvider == nil {
		return errs.ReqInvalidError{Field: "authProvider", Reason: "authProvider is required"}
	}

	p.AuthProvider = authProvider
	return nil
}
