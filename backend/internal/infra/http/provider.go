package http

import (
	"github.com/gofiber/fiber/v2"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

func (s *Server) ListProviders(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) CreateProvider(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) DeleteProvider(c *fiber.Ctx, projectId openapi_types.UUID, providerId openapi_types.UUID) error {
	return nil
}

func (s *Server) GetProvider(c *fiber.Ctx, projectId openapi_types.UUID, providerId openapi_types.UUID) error {
	return nil
}

func (s *Server) UpdateProvider(c *fiber.Ctx, projectId openapi_types.UUID, providerId openapi_types.UUID) error {
	return nil
}
