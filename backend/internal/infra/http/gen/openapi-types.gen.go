// Package gen provides primitives to interact with the openapi HTTP API.
//
// Code generated by github.com/oapi-codegen/oapi-codegen/v2 version v2.4.1 DO NOT EDIT.
package gen

import (
	"time"

	uuid "github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

const (
	BearerAuthScopes = "BearerAuth.Scopes"
)

// Defines values for AuthProviderProvider.
const (
	AuthProviderProviderSupabase AuthProviderProvider = "supabase"
)

// Defines values for ProviderModel.
const (
	Claude35Haiku  ProviderModel = "claude-3-5-haiku"
	Claude35Sonnet ProviderModel = "claude-3-5-sonnet"
	Claude37Sonnet ProviderModel = "claude-3-7-sonnet"
	Gpt4o          ProviderModel = "gpt-4o"
	Gpt4oMini      ProviderModel = "gpt-4o-mini"
)

// Defines values for ProviderType.
const (
	Anthropic ProviderType = "anthropic"
	Openai    ProviderType = "openai"
)

// Defines values for UpdateAuthRequestProvider.
const (
	UpdateAuthRequestProviderSupabase UpdateAuthRequestProvider = "supabase"
)

// AuthProvider defines model for AuthProvider.
type AuthProvider struct {
	Config   map[string]interface{} `json:"config"`
	Provider AuthProviderProvider   `json:"provider"`
}

// AuthProviderProvider defines model for AuthProvider.Provider.
type AuthProviderProvider string

// CreateCredentialRequest defines model for CreateCredentialRequest.
type CreateCredentialRequest struct {
	ApiKey   string       `json:"apiKey"`
	Name     string       `json:"name"`
	Provider ProviderType `json:"provider"`
}

// CreateModelRequest defines model for CreateModelRequest.
type CreateModelRequest struct {
	CredentialId  openapi_types.UUID     `json:"credentialId"`
	Name          string                 `json:"name"`
	Parameters    map[string]interface{} `json:"parameters"`
	ProviderModel string                 `json:"providerModel"`
	SystemPrompt  string                 `json:"systemPrompt"`
}

// CreateProjectRequest defines model for CreateProjectRequest.
type CreateProjectRequest struct {
	Name string `json:"name"`
}

// Credential defines model for Credential.
type Credential struct {
	ApiKey    string       `json:"apiKey"`
	CreatedAt *time.Time   `json:"createdAt,omitempty"`
	Id        UUID         `json:"id"`
	Name      string       `json:"name"`
	Provider  ProviderType `json:"provider"`
	UpdatedAt *time.Time   `json:"updatedAt,omitempty"`
}

// Model defines model for Model.
type Model struct {
	CreatedAt     time.Time              `json:"createdAt"`
	Credential    Credential             `json:"credential"`
	Id            UUID                   `json:"id"`
	Name          *string                `json:"name,omitempty"`
	Parameters    map[string]interface{} `json:"parameters"`
	ProviderModel ProviderModel          `json:"providerModel"`
	Slug          string                 `json:"slug"`
	SystemPrompt  string                 `json:"systemPrompt"`
	UpdatedAt     time.Time              `json:"updatedAt"`
}

// Project defines model for Project.
type Project struct {
	AuthProvider AuthProvider `json:"authProvider"`
	CreatedAt    time.Time    `json:"createdAt"`
	Credentials  []Credential `json:"credentials"`
	Id           UUID         `json:"id"`
	Models       []Model      `json:"models"`
	Name         string       `json:"name"`
	UpdatedAt    time.Time    `json:"updatedAt"`
}

// ProviderModel defines model for ProviderModel.
type ProviderModel string

// ProviderType defines model for ProviderType.
type ProviderType string

// TextGenerationRequest defines model for TextGenerationRequest.
type TextGenerationRequest struct {
	ModelSlug string `json:"modelSlug"`
	Prompt    string `json:"prompt"`
}

// UUID defines model for UUID.
type UUID = uuid.UUID

// UpdateAuthRequest defines model for UpdateAuthRequest.
type UpdateAuthRequest struct {
	Config   map[string]interface{}    `json:"config"`
	Provider UpdateAuthRequestProvider `json:"provider"`
}

// UpdateAuthRequestProvider defines model for UpdateAuthRequest.Provider.
type UpdateAuthRequestProvider string

// UpdateCredentialRequest defines model for UpdateCredentialRequest.
type UpdateCredentialRequest struct {
	ApiKey string `json:"apiKey"`
	Name   string `json:"name"`
}

// UpdateModelRequest defines model for UpdateModelRequest.
type UpdateModelRequest struct {
	CredentialId  openapi_types.UUID     `json:"credentialId"`
	Name          string                 `json:"name"`
	Parameters    map[string]interface{} `json:"parameters"`
	ProviderModel ProviderModel          `json:"providerModel"`
	SystemPrompt  string                 `json:"systemPrompt"`
}

// UpdateProjectRequest defines model for UpdateProjectRequest.
type UpdateProjectRequest struct {
	Name string `json:"name"`
}

// CreateProjectJSONRequestBody defines body for CreateProject for application/json ContentType.
type CreateProjectJSONRequestBody = CreateProjectRequest

// UpdateProjectJSONRequestBody defines body for UpdateProject for application/json ContentType.
type UpdateProjectJSONRequestBody = UpdateProjectRequest

// UpdateAuthJSONRequestBody defines body for UpdateAuth for application/json ContentType.
type UpdateAuthJSONRequestBody = UpdateAuthRequest

// CreateCredentialJSONRequestBody defines body for CreateCredential for application/json ContentType.
type CreateCredentialJSONRequestBody = CreateCredentialRequest

// UpdateCredentialJSONRequestBody defines body for UpdateCredential for application/json ContentType.
type UpdateCredentialJSONRequestBody = UpdateCredentialRequest

// GenerateTextJSONRequestBody defines body for GenerateText for application/json ContentType.
type GenerateTextJSONRequestBody = TextGenerationRequest

// CreateModelJSONRequestBody defines body for CreateModel for application/json ContentType.
type CreateModelJSONRequestBody = CreateModelRequest

// UpdateModelJSONRequestBody defines body for UpdateModel for application/json ContentType.
type UpdateModelJSONRequestBody = UpdateModelRequest

// StreamTextJSONRequestBody defines body for StreamText for application/json ContentType.
type StreamTextJSONRequestBody = TextGenerationRequest
