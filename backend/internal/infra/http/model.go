package http

import (
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/command"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/infra/http/gen"
	"github.com/supallm/core/internal/pkg/slug"
)

func (s *Server) CreateModel(c *fiber.Ctx, projectID gen.UUID) error {
	var req gen.CreateModelRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	slug := slug.Make(req.Name)
	err := s.app.Commands.AddModel.Handle(c.Context(), command.AddModelCommand{
		ProjectID:     projectID,
		ModelID:       uuid.New(),
		Name:          req.Name,
		Slug:          slug,
		CredentialID:  req.CredentialId,
		ProviderModel: model.ProviderModel(req.ProviderModel),
		SystemPrompt:  model.Prompt(req.SystemPrompt),
		Parameters: model.ModelParameters{
			MaxTokens:   validateMaxTokens(req.Parameters.MaxTokens),
			Temperature: float64(req.Parameters.Temperature),
		},
	})
	if err != nil {
		return err
	}

	return s.server.RespondWithContentLocation(c, fiber.StatusCreated, "/projects/%s/models/%s", projectID, slug)
}

func (s *Server) GetModel(c *fiber.Ctx, projectID gen.UUID, modelSlug string) error {
	model, err := s.app.Queries.GetModel.Handle(c.Context(), query.GetModelQuery{
		ProjectID: projectID,
		ModelSlug: slug.Slug(modelSlug),
	})
	if err != nil {
		return err
	}

	return s.server.Respond(c, fiber.StatusOK, queryModelToDTO(model))
}

func (s *Server) UpdateModel(c *fiber.Ctx, projectID gen.UUID, modelSlug string) error {
	var req gen.UpdateModelRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	err := s.app.Commands.UpdateModel.Handle(c.Context(), command.UpdateModelCommand{
		ProjectID:     projectID,
		Name:          req.Name,
		Slug:          slug.Slug(modelSlug),
		CredentialID:  req.CredentialId,
		ProviderModel: model.ProviderModel(req.ProviderModel),
		SystemPrompt:  model.Prompt(req.SystemPrompt),
	})
	if err != nil {
		return err
	}

	return s.server.RespondWithContentLocation(
		c,
		fiber.StatusNoContent,
		"/projects/%s/models/%s",
		projectID,
		slug.Slug(modelSlug),
	)
}

func (s *Server) DeleteModel(c *fiber.Ctx, projectID gen.UUID, modelSlug string) error {
	err := s.app.Commands.RemoveModel.Handle(c.Context(), command.RemoveModelCommand{
		ProjectID: projectID,
		Slug:      slug.Slug(modelSlug),
	})
	if err != nil {
		return err
	}

	return s.server.Respond(c, fiber.StatusNoContent, nil)
}

func (s *Server) ListModels(c *fiber.Ctx, projectID gen.UUID) error {
	models, err := s.app.Queries.ListModels.Handle(c.Context(), query.ListModelsQuery{
		ProjectID: projectID,
	})
	if err != nil {
		return err
	}
	return s.server.Respond(c, fiber.StatusOK, queryModelsToDTOs(models))
}

func validateMaxTokens(tokens int) uint32 {
	if tokens < 0 {
		return 0
	}
	if tokens > math.MaxUint32 {
		return math.MaxUint32
	}
	return uint32(tokens)
}
