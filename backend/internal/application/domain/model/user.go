package model

import (
	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/auth"
)

type User struct {
	ID           uuid.UUID
	Email        string
	Name         string
	PasswordHash auth.Hash
}
