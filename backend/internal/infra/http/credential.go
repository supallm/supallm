package http

import (
	"github.com/gofiber/fiber/v2"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

func (s *Server) ListCredentials(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) CreateCredential(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) DeleteCredential(c *fiber.Ctx, projectId openapi_types.UUID, llmCredentialId openapi_types.UUID) error {
	return nil
}

func (s *Server) GetCredential(c *fiber.Ctx, projectId openapi_types.UUID, llmCredentialId openapi_types.UUID) error {
	return nil
}

func (s *Server) UpdateCredential(c *fiber.Ctx, projectId openapi_types.UUID, llmCredentialId openapi_types.UUID) error {
	return nil
}
