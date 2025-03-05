package model

import (
	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/errs"
	"github.com/supallm/core/internal/pkg/slug"
)

// Project represents a supallm root configuration
type Project struct {
	ID           uuid.UUID
	UserID       string
	Name         string
	AuthProvider AuthProvider
	Credentials  map[uuid.UUID]*LLMCredential
	Models       map[slug.Slug]*Model
}

func NewProject(id uuid.UUID, userID string, name string) (*Project, error) {
	if id == uuid.Nil {
		return nil, errs.ErrReqInvalid{Field: "id", Reason: "id is required"}
	}

	if userID == "" {
		return nil, errs.ErrReqInvalid{Field: "userID", Reason: "userID is required"}
	}

	if name == "" {
		return nil, errs.ErrReqInvalid{Field: "name", Reason: "name is required"}
	}

	return &Project{
		ID:     id,
		UserID: userID,
		Name:   name,
	}, nil
}

func (p *Project) UpdateName(name string) error {
	if name == "" {
		return errs.ErrReqInvalid{Field: "name", Reason: "name is required"}
	}

	p.Name = name
	return nil
}
