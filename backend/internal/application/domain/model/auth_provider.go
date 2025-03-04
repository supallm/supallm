package model

import (
	"errors"
	"fmt"
)

type AuthProviderType string

const (
	AuthProviderSupabase AuthProviderType = "supabase"
	AuthProviderClerk    AuthProviderType = "clerk"
)

type AuthProvider interface {
	GetType() AuthProviderType
	Validate() error
}

type SupabaseAuthProvider struct {
	URL string
	Key ApiKey
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

type ClerkAuthProvider struct {
	PublishableKey string
	SecretKey      string
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

func (p *Project) NewAuthProvider(providerType AuthProviderType, config map[string]any) error {
	switch providerType {
	case AuthProviderSupabase:
		url, _ := config["url"].(string)
		key, _ := config["key"].(string)
		provider := SupabaseAuthProvider{
			URL: url,
			Key: ApiKey(key),
		}
		if err := provider.Validate(); err != nil {
			return err
		}
		p.AuthProvider = provider
		return nil

	case AuthProviderClerk:
		publishableKey, _ := config["publishable_key"].(string)
		secretKey, _ := config["secret_key"].(string)
		provider := ClerkAuthProvider{
			PublishableKey: publishableKey,
			SecretKey:      secretKey,
		}
		if err := provider.Validate(); err != nil {
			return err
		}
		p.AuthProvider = provider
		return nil

	default:
		return fmt.Errorf("unsupported auth provider type: %s", providerType)
	}
}
