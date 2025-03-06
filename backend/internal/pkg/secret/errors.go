package secret

type SecretError string

func (e SecretError) Error() string {
	return string(e)
}

const (
	ErrKeyNotSet          SecretError = "key not set"
	ErrCiphertextTooShort SecretError = "ciphertext too short"
)
