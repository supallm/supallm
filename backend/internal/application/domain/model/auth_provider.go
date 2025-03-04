package model

import (
	"errors"
	"fmt"

	"github.com/supallm/core/internal/pkg/secret"
)

type AuthProviderType string

func (t AuthProviderType) String() string {
	return string(t)
}

const (
	AuthProviderSupabase AuthProviderType = "supabase"
	AuthProviderClerk    AuthProviderType = "clerk"
)

type AuthProvider interface {
	GetType() AuthProviderType
	Validate() error
	Config() map[string]any
}

type SupabaseAuthProvider struct {
	URL string
	Key secret.ApiKey
}

func (s SupabaseAuthProvider) GetType() AuthProviderType {
	return AuthProviderSupabase
}

func (s SupabaseAuthProvider) Validate() error {
	if s.URL == "" {
		return errors.New("supabase URL is required")
	}
	if s.Key == "" {
		return errors.New("supabase key is required")
	}
	return nil
}

func (s SupabaseAuthProvider) Config() map[string]any {
	return map[string]any{
		"url": s.URL,
		"key": s.Key,
	}
}

type ClerkAuthProvider struct {
	PublishableKey secret.ApiKey
	SecretKey      secret.ApiKey
}

func (c ClerkAuthProvider) GetType() AuthProviderType {
	return AuthProviderClerk
}

func (c ClerkAuthProvider) Validate() error {
	if c.PublishableKey == "" {
		return errors.New("clerk publishable key is required")
	}
	if c.SecretKey == "" {
		return errors.New("clerk secret key is required")
	}
	return nil
}

func (c ClerkAuthProvider) Config() map[string]any {
	return map[string]any{
		"publishable_key": c.PublishableKey,
		"secret_key":      c.SecretKey,
	}
}

func UnmarshalAuthProvider(providerType AuthProviderType, config map[string]any) (AuthProvider, error) {
	switch providerType {
	case AuthProviderSupabase:
		url, ok := config["url"].(string)
		if !ok {
			return nil, errors.New("url is required")
		}
		key, ok := config["key"].(string)
		if !ok {
			return nil, errors.New("key is required")
		}
		return SupabaseAuthProvider{
			URL: url,
			Key: secret.ApiKey(key),
		}, nil
	case AuthProviderClerk:
		publishableKey, ok := config["publishable_key"].(string)
		if !ok {
			return nil, errors.New("publishable key is required")
		}
		secretKey, ok := config["secret_key"].(string)
		if !ok {
			return nil, errors.New("secret key is required")
		}
		return ClerkAuthProvider{
			PublishableKey: secret.ApiKey(publishableKey),
			SecretKey:      secret.ApiKey(secretKey),
		}, nil
	default:
		return nil, fmt.Errorf("unsupported auth provider type: %s", providerType)
	}
}

func (p *Project) NewAuthProvider(providerType AuthProviderType, config map[string]any) error {
	ap, err := UnmarshalAuthProvider(providerType, config)
	if err != nil {
		return err
	}
	if err := ap.Validate(); err != nil {
		return err
	}
	p.AuthProvider = ap
	return nil
}
