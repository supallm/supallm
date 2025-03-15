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

	"github.com/lithammer/shortuuid"
)

//nolint:all
var envKey = []byte(os.Getenv("SECRET_KEY"))

const (
	keyPrefix = "sk_"
)

type (
	APIKey    string
	Encrypted string
)

func (e Encrypted) String() string {
	return string(e)
}

func (a APIKey) String() string {
	return string(a)
}

func (a APIKey) Obfuscate() string {
	return a.String()[:4] + "..." + a.String()[len(a.String())-4:]
}

// EncryptData encrypts data using AES-GCM
func (a APIKey) Encrypt(key ...[]byte) (Encrypted, error) {
	if len(a) == 0 {
		return "", ErrKeyNotSet
	}

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
	return Encrypted(hex.EncodeToString(ciphertext)), nil
}

// DecryptData decrypts data using AES-GCM
func (e Encrypted) Decrypt(key ...[]byte) (APIKey, error) {
	k := envKey
	if len(key) >= 1 {
		k = key[0]
	}

	ciphertext, err := hex.DecodeString(e.String())
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
		return "", ErrCiphertextTooShort
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

// GenerateAPIKey generates a new API key with her secret
func GenerateAPIKey(secret ...[]byte) (APIKey, Encrypted, error) {
	token := shortuuid.New()
	apiKey := APIKey(keyPrefix + token)

	encrypted, err := apiKey.Encrypt(secret...)
	if err != nil {
		return "", "", err
	}

	return apiKey, encrypted, nil
}

func (e Encrypted) Verify(apiKey APIKey) error {
	decrypted, err := e.Decrypt()
	if err != nil {
		return err
	}

	if decrypted != apiKey {
		return errors.New("invalid API key")
	}

	return nil
}
