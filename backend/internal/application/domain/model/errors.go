package model

type Error string

func (e Error) Error() string {
	return string(e)
}

const (
	ErrInvalidID     Error = "invalid id"
	ErrInvalidUserID Error = "invalid user id"
	ErrInvalidName   Error = "invalid name"

	ErrProviderNameRequired Error = "provider name is required"

	ErrProviderNotFound          Error = "provider not found"
	ErrModelNotFound             Error = "model not found"
	ErrModelExists               Error = "model already exists"
	ErrProviderModelNotSupported Error = "provider model not supported"

	//nolint:all
	ErrCredentialNotSupported Error = "credential not supported"

	ErrInvalidModelSlug Error = "invalid model slug"
	ErrInvalidModel     Error = "invalid model"

	//nolint:all
	ErrCredentialNotFound Error = "credential not found"

	//nolint:all
	ErrInvalidCredential    Error = "invalid credential"
	ErrInvalidProviderModel Error = "invalid provider model"
)
