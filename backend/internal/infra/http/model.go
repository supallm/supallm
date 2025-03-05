package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/supallm/core/internal/infra/http/gen"
)

func (s *Server) ListModels(c *fiber.Ctx, projectId gen.UUID) error {
	return nil
}

func (s *Server) CreateModel(c *fiber.Ctx, projectId gen.UUID) error {
	return nil
}

func (s *Server) DeleteModel(c *fiber.Ctx, projectId gen.UUID, slug string) error {
	return nil
}

func (s *Server) GetModel(c *fiber.Ctx, projectId gen.UUID, slug string) error {
	return nil
}

func (s *Server) UpdateModel(c *fiber.Ctx, projectId gen.UUID, slug string) error {
	return nil
}
