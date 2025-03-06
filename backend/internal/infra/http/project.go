package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/command"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/infra/http/gen"
)

func (s *Server) CreateProject(c *fiber.Ctx) error {
	var req gen.CreateProjectRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	projectID := uuid.New()
	err := s.app.Commands.CreateProject.Handle(c.Context(), command.CreateProjectCommand{
		ID:     projectID,
		Name:   req.Name,
		UserID: s.server.GetUserID(c),
	})
	if err != nil {
		return err
	}

	return s.server.RespondWithContentLocation(c, fiber.StatusCreated, "/projects/%s", projectID.String())
}

func (s *Server) GetProject(c *fiber.Ctx, projectID gen.UUID) error {
	project, err := s.app.Queries.GetProject.Handle(c.Context(), query.GetProjectQuery{
		ProjectID: projectID,
	})
	if err != nil {
		return err
	}
	return s.server.Respond(c, fiber.StatusOK, queryProjectToDTO(project))
}

func (s *Server) UpdateProject(c *fiber.Ctx, projectID gen.UUID) error {
	var req gen.UpdateProjectRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	err := s.app.Commands.UpdateProjectName.Handle(c.Context(), command.UpdateProjectNameCommand{
		ProjectID: projectID,
		Name:      req.Name,
	})
	if err != nil {
		return err
	}

	return s.server.Respond(c, fiber.StatusOK, nil)
}

func (s *Server) DeleteProject(c *fiber.Ctx, _ gen.UUID) error {
	return s.server.Respond(c, fiber.StatusOK, nil)
}

func (s *Server) ListProjects(c *fiber.Ctx) error {
	projects, err := s.app.Queries.ListProjects.Handle(c.Context(), query.ListProjectsQuery{
		UserID: s.server.GetUserID(c),
	})
	if err != nil {
		return err
	}
	return s.server.Respond(c, fiber.StatusOK, queryProjectsToDTOs(projects))
}
