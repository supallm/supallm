package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/supallm/core/internal/infra/http/gen"
)

func (s *Server) ListCredentials(c *fiber.Ctx, projectId gen.UUID) error {
	return nil
}

func (s *Server) CreateCredential(c *fiber.Ctx, projectId gen.UUID) error {
	return nil
}

func (s *Server) DeleteCredential(c *fiber.Ctx, projectId gen.UUID, llmCredentialId gen.UUID) error {
	return nil
}

func (s *Server) GetCredential(c *fiber.Ctx, projectId gen.UUID, llmCredentialId gen.UUID) error {
	return nil
}

func (s *Server) UpdateCredential(c *fiber.Ctx, projectId gen.UUID, llmCredentialId gen.UUID) error {
	return nil
}
