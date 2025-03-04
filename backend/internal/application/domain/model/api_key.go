package model

import "github.com/supallm/core/internal/pkg/secret"

type ApiKey string

func (a ApiKey) String() string {
	return string(a)
}

func (a ApiKey) Obfuscate() string {
	return a.String()[:4] + "..." + a.String()[len(a.String())-4:]
}

func (a ApiKey) Encrypt() (string, error) {
	return secret.EncryptData(a.String())
}

func (a ApiKey) Decrypt() (string, error) {
	return secret.DecryptData(a.String())
}
