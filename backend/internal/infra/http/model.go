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

	slug := slug.Slug(req.Name)
	id := uuid.New()
	err := s.app.Commands.AddModel.Handle(c.Context(), command.AddModelCommand{
		ProjectID:     projectID,
		ModelID:       id,
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

func (s *Server) GetModel(_ *fiber.Ctx, _ gen.UUID, _ string) error {
	return nil
}

func (s *Server) UpdateModel(_ *fiber.Ctx, _ gen.UUID, _ string) error {
	return nil
}

func (s *Server) DeleteModel(_ *fiber.Ctx, _ gen.UUID, _ string) error {
	return nil
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
