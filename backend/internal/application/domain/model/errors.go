package model

type Err string

func (e Err) Error() string {
	return string(e)
}

const (
	ErrInvalidID     Err = "invalid id"
	ErrInvalidUserID Err = "invalid user id"
	ErrInvalidName   Err = "invalid name"

	ErrProviderNameRequired Err = "provider name is required"

	ErrProviderNotFound          Err = "provider not found"
	ErrModelNotFound             Err = "model not found"
	ErrModelExists               Err = "model already exists"
	ErrProviderModelNotSupported Err = "provider model not supported"
	ErrCredentialNotSupported    Err = "credential not supported"

	ErrInvalidModelSlug Err = "invalid model slug"
	ErrInvalidModel     Err = "invalid model"

	ErrCredentialNotFound Err = "credential not found"

	ErrInvalidCredential    Err = "invalid credential"
	ErrInvalidProviderModel Err = "invalid provider model"
)
