// Package http provides primitives to interact with the openapi HTTP API.
//
// Code generated by github.com/oapi-codegen/oapi-codegen/v2 version v2.4.1 DO NOT EDIT.
package http

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/oapi-codegen/runtime"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

// ServerInterface represents all server handlers.
type ServerInterface interface {
	// Get authentication
	// (GET /auth)
	GetAuth(c *fiber.Ctx) error
	// Update authentication
	// (PUT /auth)
	UpdateAuth(c *fiber.Ctx) error
	// Generate text (HTTP blocking)
	// (POST /generateText)
	GenerateText(c *fiber.Ctx) error
	// List all providers
	// (GET /providers)
	ListProviders(c *fiber.Ctx) error
	// Create a provider
	// (POST /providers)
	CreateProvider(c *fiber.Ctx) error
	// Delete a provider
	// (DELETE /providers/{id})
	DeleteProvider(c *fiber.Ctx, id openapi_types.UUID) error
	// Get a provider by ID
	// (GET /providers/{id})
	GetProvider(c *fiber.Ctx, id openapi_types.UUID) error
	// Generate text in streaming (SSE)
	// (POST /streamText)
	StreamText(c *fiber.Ctx) error
	// List system prompts
	// (GET /system-prompts)
	ListSystemPrompts(c *fiber.Ctx) error
	// Create a system prompt
	// (POST /system-prompts)
	CreateSystemPrompt(c *fiber.Ctx) error
}

// ServerInterfaceWrapper converts contexts to parameters.
type ServerInterfaceWrapper struct {
	Handler ServerInterface
}

type MiddlewareFunc fiber.Handler

// GetAuth operation middleware
func (siw *ServerInterfaceWrapper) GetAuth(c *fiber.Ctx) error {

	return siw.Handler.GetAuth(c)
}

// UpdateAuth operation middleware
func (siw *ServerInterfaceWrapper) UpdateAuth(c *fiber.Ctx) error {

	return siw.Handler.UpdateAuth(c)
}

// GenerateText operation middleware
func (siw *ServerInterfaceWrapper) GenerateText(c *fiber.Ctx) error {

	return siw.Handler.GenerateText(c)
}

// ListProviders operation middleware
func (siw *ServerInterfaceWrapper) ListProviders(c *fiber.Ctx) error {

	return siw.Handler.ListProviders(c)
}

// CreateProvider operation middleware
func (siw *ServerInterfaceWrapper) CreateProvider(c *fiber.Ctx) error {

	return siw.Handler.CreateProvider(c)
}

// DeleteProvider operation middleware
func (siw *ServerInterfaceWrapper) DeleteProvider(c *fiber.Ctx) error {

	var err error

	// ------------- Path parameter "id" -------------
	var id openapi_types.UUID

	err = runtime.BindStyledParameterWithOptions("simple", "id", c.Params("id"), &id, runtime.BindStyledParameterOptions{Explode: false, Required: true})
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Errorf("Invalid format for parameter id: %w", err).Error())
	}

	return siw.Handler.DeleteProvider(c, id)
}

// GetProvider operation middleware
func (siw *ServerInterfaceWrapper) GetProvider(c *fiber.Ctx) error {

	var err error

	// ------------- Path parameter "id" -------------
	var id openapi_types.UUID

	err = runtime.BindStyledParameterWithOptions("simple", "id", c.Params("id"), &id, runtime.BindStyledParameterOptions{Explode: false, Required: true})
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Errorf("Invalid format for parameter id: %w", err).Error())
	}

	return siw.Handler.GetProvider(c, id)
}

// StreamText operation middleware
func (siw *ServerInterfaceWrapper) StreamText(c *fiber.Ctx) error {

	return siw.Handler.StreamText(c)
}

// ListSystemPrompts operation middleware
func (siw *ServerInterfaceWrapper) ListSystemPrompts(c *fiber.Ctx) error {

	return siw.Handler.ListSystemPrompts(c)
}

// CreateSystemPrompt operation middleware
func (siw *ServerInterfaceWrapper) CreateSystemPrompt(c *fiber.Ctx) error {

	return siw.Handler.CreateSystemPrompt(c)
}

// FiberServerOptions provides options for the Fiber server.
type FiberServerOptions struct {
	BaseURL     string
	Middlewares []MiddlewareFunc
}

// RegisterHandlers creates http.Handler with routing matching OpenAPI spec.
func RegisterHandlers(router fiber.Router, si ServerInterface) {
	RegisterHandlersWithOptions(router, si, FiberServerOptions{})
}

// RegisterHandlersWithOptions creates http.Handler with additional options
func RegisterHandlersWithOptions(router fiber.Router, si ServerInterface, options FiberServerOptions) {
	wrapper := ServerInterfaceWrapper{
		Handler: si,
	}

	for _, m := range options.Middlewares {
		router.Use(fiber.Handler(m))
	}

	router.Get(options.BaseURL+"/auth", wrapper.GetAuth)

	router.Put(options.BaseURL+"/auth", wrapper.UpdateAuth)

	router.Post(options.BaseURL+"/generateText", wrapper.GenerateText)

	router.Get(options.BaseURL+"/providers", wrapper.ListProviders)

	router.Post(options.BaseURL+"/providers", wrapper.CreateProvider)

	router.Delete(options.BaseURL+"/providers/:id", wrapper.DeleteProvider)

	router.Get(options.BaseURL+"/providers/:id", wrapper.GetProvider)

	router.Post(options.BaseURL+"/streamText", wrapper.StreamText)

	router.Get(options.BaseURL+"/system-prompts", wrapper.ListSystemPrompts)

	router.Post(options.BaseURL+"/system-prompts", wrapper.CreateSystemPrompt)

}
