package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"github.com/supallm/core/internal/application/command"
	"github.com/supallm/core/internal/infra/http/gen"
)

func (s *Server) CreateProject(c *fiber.Ctx) error {
	var req gen.CreateProjectRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	projectId := uuid.New()
	err := s.app.Commands.CreateProject.Handle(c.Context(), command.CreateProjectCommand{
		ID:     projectId,
		Name:   req.Name,
		UserID: s.server.GetUser(c).ID,
	})
	if err != nil {
		return err
	}

	return s.server.RespondWithContentLocation(c, fiber.StatusCreated, "/projects/%s", projectId.String())
}

func (s *Server) DeleteProject(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return s.server.Respond(c, fiber.StatusOK, nil)
}

func (s *Server) GetProject(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return s.server.Respond(c, fiber.StatusOK, nil)
}

func (s *Server) UpdateProject(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return s.server.Respond(c, fiber.StatusOK, nil)
}

func (s *Server) ListProjects(c *fiber.Ctx) error {
	return s.server.Respond(c, fiber.StatusOK, nil)
}
