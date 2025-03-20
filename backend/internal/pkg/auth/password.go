package auth

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

type Hash string

func (p Hash) String() string {
	return string(p)
}

func HashPassword(password string) (Hash, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return Hash(hash), nil
}

func CheckPassword(password string, hash Hash) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
