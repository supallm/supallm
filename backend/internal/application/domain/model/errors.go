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

	ErrProviderNotFound        Err = "provider not found"
	ErrModelNotFound           Err = "model not found"
	ErrModelExists             Err = "model already exists"
	ErrLLMModelNotSupported    Err = "llm model not supported"
	ErrLLMProviderNotSupported Err = "llm provider not supported"

	ErrInvalidModelSlug Err = "invalid model slug"
	ErrInvalidModel     Err = "invalid model"

	ErrCredentialNotFound Err = "credential not found"

	ErrInvalidLLMCredential Err = "invalid llm credential"
	ErrInvalidLLMModel      Err = "invalid llm model"
)
