package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/command"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/infra/http/gen"
	"github.com/supallm/core/internal/pkg/slug"
)

func (s *Server) CreateModel(c *fiber.Ctx, projectId gen.UUID) error {
	var req gen.CreateModelRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	slug := slug.Slug(req.Name)
	id := uuid.New()
	err := s.app.Commands.AddModel.Handle(c.Context(), command.AddModelCommand{
		ProjectID:     projectId,
		ModelID:       id,
		Name:          req.Name,
		Slug:          slug,
		CredentialID:  req.CredentialId,
		ProviderModel: model.ProviderModel(req.ProviderModel),
		SystemPrompt:  model.Prompt(req.SystemPrompt),
	})
	if err != nil {
		return err
	}

	return s.server.RespondWithContentLocation(c, fiber.StatusCreated, "/projects/%s/models/%s", projectId, slug)
}

func (s *Server) GetModel(c *fiber.Ctx, projectId gen.UUID, slug string) error {
	return nil
}

func (s *Server) UpdateModel(c *fiber.Ctx, projectId gen.UUID, slug string) error {
	return nil
}

func (s *Server) DeleteModel(c *fiber.Ctx, projectId gen.UUID, slug string) error {
	return nil
}

func (s *Server) ListModels(c *fiber.Ctx, projectId gen.UUID) error {
	models, err := s.app.Queries.ListModels.Handle(c.Context(), query.ListModelsQuery{
		ProjectID: projectId,
	})
	if err != nil {
		return err
	}
	return s.server.Respond(c, fiber.StatusOK, queryModelsToDTOs(models))
}
