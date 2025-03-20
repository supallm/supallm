package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type (
	Claims struct {
		UserID               uuid.UUID `json:"user_id" exhaustruct:"optional"`
		Email                string    `json:"email" exhaustruct:"optional"`
		Name                 string    `json:"name" exhaustruct:"optional"`
		jwt.RegisteredClaims `exhaustruct:"optional"`
	}

	Token string
)

const (
	Issuer = "supallm-api"
	expiry = 24 * time.Hour
)

func (t Token) String() string {
	return string(t)
}

func GenerateToken(userID uuid.UUID, email, name, secretKey string) (Token, error) {
	expirationTime := time.Now().Add(expiry)

	claims := &Claims{
		UserID: userID,
		Email:  email,
		Name:   name,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    Issuer,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return Token(tokenString), nil
}

func VerifyToken(tokenString, secretKey string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, new(Claims), func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token claims")
}
