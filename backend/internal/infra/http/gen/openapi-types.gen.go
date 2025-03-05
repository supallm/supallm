// Package gen provides primitives to interact with the openapi HTTP API.
//
// Code generated by github.com/oapi-codegen/oapi-codegen/v2 version v2.4.1 DO NOT EDIT.
package gen

import (
	"time"

	openapi_types "github.com/oapi-codegen/runtime/types"
)

const (
	BearerAuthScopes = "BearerAuth.Scopes"
)

// Defines values for AuthProviderProvider.
const (
	AuthProviderProviderSupabase AuthProviderProvider = "supabase"
)

// Defines values for LLMModel.
const (
	Claude35Haiku  LLMModel = "claude-3-5-haiku"
	Claude35Sonnet LLMModel = "claude-3-5-sonnet"
	Claude37Sonnet LLMModel = "claude-3-7-sonnet"
	Gpt4o          LLMModel = "gpt-4o"
	Gpt4oMini      LLMModel = "gpt-4o-mini"
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
	Config   SupabaseAuthConfig   `json:"config"`
	Provider AuthProviderProvider `json:"provider"`
}

// AuthProviderProvider defines model for AuthProvider.Provider.
type AuthProviderProvider string

// CreateLLMCredentialRequest defines model for CreateLLMCredentialRequest.
type CreateLLMCredentialRequest struct {
	ApiKey   string       `json:"apiKey"`
	Name     string       `json:"name"`
	Provider ProviderType `json:"provider"`
}

// CreateModelRequest defines model for CreateModelRequest.
type CreateModelRequest struct {
	LlmCredentialId openapi_types.UUID     `json:"llmCredentialId"`
	LlmModel        string                 `json:"llmModel"`
	Name            string                 `json:"name"`
	Parameters      map[string]interface{} `json:"parameters"`
	SystemPrompt    string                 `json:"systemPrompt"`
}

// CreateProjectRequest defines model for CreateProjectRequest.
type CreateProjectRequest struct {
	Name string `json:"name"`
}

// LLMCredential defines model for LLMCredential.
type LLMCredential struct {
	ApiKey    string             `json:"apiKey"`
	CreatedAt *time.Time         `json:"createdAt,omitempty"`
	Id        openapi_types.UUID `json:"id"`
	Name      string             `json:"name"`
	Provider  ProviderType       `json:"provider"`
	UpdatedAt *time.Time         `json:"updatedAt,omitempty"`
}

// LLMModel defines model for LLMModel.
type LLMModel string

// Model defines model for Model.
type Model struct {
	CreatedAt    time.Time              `json:"createdAt"`
	Credential   LLMCredential          `json:"credential"`
	Id           openapi_types.UUID     `json:"id"`
	LlmModel     LLMModel               `json:"llmModel"`
	Name         *string                `json:"name,omitempty"`
	Parameters   map[string]interface{} `json:"parameters"`
	Slug         string                 `json:"slug"`
	SystemPrompt string                 `json:"systemPrompt"`
	UpdatedAt    time.Time              `json:"updatedAt"`
}

// Project defines model for Project.
type Project struct {
	AuthProvider AuthProvider       `json:"authProvider"`
	CreatedAt    time.Time          `json:"createdAt"`
	Credentials  []LLMCredential    `json:"credentials"`
	Id           openapi_types.UUID `json:"id"`
	Models       []Model            `json:"models"`
	Name         string             `json:"name"`
	UpdatedAt    time.Time          `json:"updatedAt"`
	UserId       openapi_types.UUID `json:"userId"`
}

// ProviderType defines model for ProviderType.
type ProviderType string

// SupabaseAuthConfig defines model for SupabaseAuthConfig.
type SupabaseAuthConfig struct {
	Key string `json:"key"`
	Url string `json:"url"`
}

// TextGenerationRequest defines model for TextGenerationRequest.
type TextGenerationRequest struct {
	MaxTokens   *int     `json:"maxTokens,omitempty"`
	ModelSlug   string   `json:"modelSlug"`
	Prompt      string   `json:"prompt"`
	Temperature *float32 `json:"temperature,omitempty"`
}

// UpdateAuthRequest defines model for UpdateAuthRequest.
type UpdateAuthRequest struct {
	Config   SupabaseAuthConfig        `json:"config"`
	Provider UpdateAuthRequestProvider `json:"provider"`
}

// UpdateAuthRequestProvider defines model for UpdateAuthRequest.Provider.
type UpdateAuthRequestProvider string

// UpdateLLMCredentialRequest defines model for UpdateLLMCredentialRequest.
type UpdateLLMCredentialRequest struct {
	ApiKey string `json:"apiKey"`
	Name   string `json:"name"`
}

// UpdateModelRequest defines model for UpdateModelRequest.
type UpdateModelRequest struct {
	LlmCredentialId openapi_types.UUID     `json:"llmCredentialId"`
	LlmModel        LLMModel               `json:"llmModel"`
	Name            string                 `json:"name"`
	Parameters      map[string]interface{} `json:"parameters"`
	SystemPrompt    string                 `json:"systemPrompt"`
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
type CreateCredentialJSONRequestBody = CreateLLMCredentialRequest

// UpdateCredentialJSONRequestBody defines body for UpdateCredential for application/json ContentType.
type UpdateCredentialJSONRequestBody = UpdateLLMCredentialRequest

// GenerateTextJSONRequestBody defines body for GenerateText for application/json ContentType.
type GenerateTextJSONRequestBody = TextGenerationRequest

// CreateModelJSONRequestBody defines body for CreateModel for application/json ContentType.
type CreateModelJSONRequestBody = CreateModelRequest

// UpdateModelJSONRequestBody defines body for UpdateModel for application/json ContentType.
type UpdateModelJSONRequestBody = UpdateModelRequest

// StreamTextJSONRequestBody defines body for StreamText for application/json ContentType.
type StreamTextJSONRequestBody = TextGenerationRequest
