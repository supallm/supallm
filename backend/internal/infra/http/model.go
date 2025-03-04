package http

import (
	"github.com/gofiber/fiber/v2"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

func (s *Server) ListModels(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) CreateModel(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) DeleteModel(c *fiber.Ctx, projectId openapi_types.UUID, slug string) error {
	return nil
}

func (s *Server) GetModel(c *fiber.Ctx, projectId openapi_types.UUID, slug string) error {
	return nil
}

func (s *Server) UpdateModel(c *fiber.Ctx, projectId openapi_types.UUID, slug string) error {
	return nil
}
