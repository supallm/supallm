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
	ErrWorkflowNotFound          Error = "workflow not found"
	ErrWorkflowExists            Error = "workflow already exists"
	ErrProviderModelNotSupported Error = "provider model not supported"

	//nolint:all
	ErrCredentialNotSupported Error = "credential not supported"

	ErrInvalidWorkflow Error = "invalid workflow"

	//nolint:all
	ErrCredentialNotFound Error = "credential not found"

	//nolint:all
	ErrInvalidCredential    Error = "invalid credential"
	ErrInvalidProviderModel Error = "invalid provider model"

	ErrInvalidNodeError Error = "invalid node type"
)
