package secret

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"io"
	"os"
)

//nolint:all
var envKey = []byte(os.Getenv("SECRET_KEY"))

type APIKey string

func (a APIKey) String() string {
	return string(a)
}

func (a APIKey) Obfuscate() string {
	return a.String()[:4] + "..." + a.String()[len(a.String())-4:]
}

// EncryptData encrypts data using AES-GCM
func (a APIKey) Encrypt(key ...[]byte) (string, error) {
	k := envKey
	if len(key) >= 1 {
		k = key[0]
	}

	block, err := aes.NewCipher(deriveKey(k))
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := aesGCM.Seal(nonce, nonce, []byte(a), nil)
	return hex.EncodeToString(ciphertext), nil
}

// DecryptData decrypts data using AES-GCM
func Decrypt(encrypted string, key ...[]byte) (APIKey, error) {
	k := envKey
	if len(key) >= 1 {
		k = key[0]
	}

	ciphertext, err := hex.DecodeString(encrypted)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(deriveKey(k))
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := aesGCM.NonceSize()

	if len(ciphertext) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return APIKey(plaintext), nil
}

func deriveKey(baseKey []byte) []byte {
	h := sha256.New()
	h.Write(baseKey)
	return h.Sum(nil)
}
