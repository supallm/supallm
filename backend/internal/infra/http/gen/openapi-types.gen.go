// Package gen provides primitives to interact with the openapi HTTP API.
//
// Code generated by github.com/oapi-codegen/oapi-codegen/v2 version v2.4.1 DO NOT EDIT.
package gen

import (
	"time"

	uuid "github.com/google/uuid"
)

const (
	BearerAuthScopes = "BearerAuth.Scopes"
)

// Defines values for AuthProviderProvider.
const (
	AuthProviderProviderClerk    AuthProviderProvider = "clerk"
	AuthProviderProviderFirebase AuthProviderProvider = "firebase"
	AuthProviderProviderSupabase AuthProviderProvider = "supabase"
)

// Defines values for ProviderType.
const (
	Anthropic ProviderType = "anthropic"
	Deepseek  ProviderType = "deepseek"
	E2b       ProviderType = "e2b"
	Gemini    ProviderType = "gemini"
	Groq      ProviderType = "groq"
	Mistral   ProviderType = "mistral"
	Ollama    ProviderType = "ollama"
	Openai    ProviderType = "openai"
)

// Defines values for UpdateAuthRequestProvider.
const (
	UpdateAuthRequestProviderClerk    UpdateAuthRequestProvider = "clerk"
	UpdateAuthRequestProviderFirebase UpdateAuthRequestProvider = "firebase"
	UpdateAuthRequestProviderSupabase UpdateAuthRequestProvider = "supabase"
)

// ApiKey defines model for ApiKey.
type ApiKey struct {
	CreatedAt time.Time `json:"createdAt"`
	Id        UUID      `json:"id"`
	Key       string    `json:"key"`
}

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

// CreateProjectRequest defines model for CreateProjectRequest.
type CreateProjectRequest struct {
	Name string `json:"name"`
}

// CreateWorkflowRequest defines model for CreateWorkflowRequest.
type CreateWorkflowRequest struct {
	BuilderFlow map[string]interface{} `json:"builderFlow"`
	Name        string                 `json:"name"`
}

// Credential defines model for Credential.
type Credential struct {
	ApiKey    string       `json:"apiKey"`
	CreatedAt time.Time    `json:"createdAt"`
	Id        UUID         `json:"id"`
	Name      string       `json:"name"`
	Provider  ProviderType `json:"provider"`
	UpdatedAt time.Time    `json:"updatedAt"`
}

// Execution defines model for Execution.
type Execution struct {
	AllNodes       []string                 `json:"allNodes"`
	CompletedNodes []string                 `json:"completedNodes"`
	NodeExecutions map[string]NodeExecution `json:"nodeExecutions"`
	SessionId      string                   `json:"sessionId"`
	TriggerId      string                   `json:"triggerId"`
	WorkflowId     string                   `json:"workflowId"`
	WorkflowInputs WorkflowInputs           `json:"workflowInputs"`
}

// LoginRequest defines model for LoginRequest.
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse defines model for LoginResponse.
type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// NodeExecution defines model for NodeExecution.
type NodeExecution struct {
	ExecutionTime int                    `json:"executionTime"`
	Id            string                 `json:"id"`
	Inputs        map[string]interface{} `json:"inputs"`
	Output        map[string]interface{} `json:"output"`
	Success       bool                   `json:"success"`
}

// Project defines model for Project.
type Project struct {
	ApiKey       ApiKey       `json:"apiKey"`
	AuthProvider AuthProvider `json:"authProvider"`
	CreatedAt    time.Time    `json:"createdAt"`
	Credentials  []Credential `json:"credentials"`
	Id           UUID         `json:"id"`
	Name         string       `json:"name"`
	UpdatedAt    time.Time    `json:"updatedAt"`
	Workflows    []Workflow   `json:"workflows"`
}

// ProviderType defines model for ProviderType.
type ProviderType string

// TriggerWorkflowRequest defines model for TriggerWorkflowRequest.
type TriggerWorkflowRequest struct {
	Inputs    map[string]interface{} `json:"inputs"`
	TriggerId UUID                   `json:"triggerId"`
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
	ApiKey *string `json:"apiKey,omitempty"`
	Name   string  `json:"name"`
}

// UpdateProjectRequest defines model for UpdateProjectRequest.
type UpdateProjectRequest struct {
	Name string `json:"name"`
}

// UpdateWorkflowRequest defines model for UpdateWorkflowRequest.
type UpdateWorkflowRequest struct {
	BuilderFlow map[string]interface{} `json:"builderFlow"`
	Name        string                 `json:"name"`
}

// User defines model for User.
type User struct {
	Email string `json:"email"`
	Id    UUID   `json:"id"`
	Name  string `json:"name"`
}

// Workflow defines model for Workflow.
type Workflow struct {
	BuilderFlow map[string]interface{} `json:"builderFlow"`
	CreatedAt   time.Time              `json:"createdAt"`
	Id          string                 `json:"id"`
	Name        string                 `json:"name"`
	UpdatedAt   time.Time              `json:"updatedAt"`
}

// WorkflowInputs defines model for WorkflowInputs.
type WorkflowInputs struct {
	Prompt string `json:"prompt"`
}

// LoginJSONRequestBody defines body for Login for application/json ContentType.
type LoginJSONRequestBody = LoginRequest

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

// CreateWorkflowJSONRequestBody defines body for CreateWorkflow for application/json ContentType.
type CreateWorkflowJSONRequestBody = CreateWorkflowRequest

// UpdateWorkflowJSONRequestBody defines body for UpdateWorkflow for application/json ContentType.
type UpdateWorkflowJSONRequestBody = UpdateWorkflowRequest

// TriggerWorkflowJSONRequestBody defines body for TriggerWorkflow for application/json ContentType.
type TriggerWorkflowJSONRequestBody = TriggerWorkflowRequest
