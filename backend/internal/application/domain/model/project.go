package model

import (
	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/errs"
)

type Project struct {
	ID           uuid.UUID
	UserID       string
	Name         string
	AuthProvider AuthProvider
	Credentials  map[uuid.UUID]*Credential
	Workflows    map[WorkflowID]*Workflow
	APIKeys      []*APIKey
}

func NewProject(id uuid.UUID, userID string, name string) (*Project, error) {
	if id == uuid.Nil {
		return nil, errs.InvalidError{Field: "id", Reason: "id is required"}
	}

	if userID == "" {
		return nil, errs.InvalidError{Field: "userID", Reason: "userID is required"}
	}

	if name == "" {
		return nil, errs.InvalidError{Field: "name", Reason: "name is required"}
	}

	p := &Project{
		ID:           id,
		UserID:       userID,
		Name:         name,
		AuthProvider: nil,
		Credentials:  map[uuid.UUID]*Credential{},
		Workflows:    map[WorkflowID]*Workflow{},
		APIKeys:      make([]*APIKey, 0),
	}

	err := p.addAPIKey()
	if err != nil {
		return nil, errs.InternalError{Err: err}
	}

	return p, nil
}

func (p *Project) UpdateName(name string) error {
	if name == "" {
		return errs.InvalidError{Field: "name", Reason: "name is required"}
	}

	p.Name = name
	return nil
}

func (p *Project) UpdateAuthProvider(authProvider AuthProvider) error {
	if authProvider == nil {
		return errs.InvalidError{Field: "authProvider", Reason: "authProvider is required"}
	}

	p.AuthProvider = authProvider
	return nil
}
