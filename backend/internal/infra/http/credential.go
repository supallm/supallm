package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/command"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/infra/http/gen"
	"github.com/supallm/core/internal/pkg/secret"
)

func (s *Server) CreateCredential(c *fiber.Ctx, projectID gen.UUID) error {
	var req gen.CreateCredentialRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	id := uuid.New()
	err := s.app.Commands.AddCredential.Handle(c.Context(), command.AddCredentialCommand{
		ID:           id,
		ProjectID:    projectID,
		Name:         req.Name,
		ProviderType: model.ProviderType(req.Provider),
		APIKey:       secret.APIKey(req.ApiKey),
	})
	if err != nil {
		return err
	}

	return s.server.RespondWithContentLocation(c, fiber.StatusCreated, "/projects/%s/credentials/%s", projectID, id)
}

func (s *Server) GetCredential(_ *fiber.Ctx, _ gen.UUID, _ gen.UUID) error {
	return nil
}

func (s *Server) UpdateCredential(c *fiber.Ctx, projectID gen.UUID, credentialID gen.UUID) error {
	var req gen.UpdateCredentialRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	err := s.app.Commands.UpdateCredential.Handle(c.Context(), command.UpdateCredentialCommand{
		ID:        credentialID,
		ProjectID: projectID,
		Name:      req.Name,
		APIKey:    secret.APIKey(req.ApiKey),
	})
	if err != nil {
		return err
	}

	return s.server.RespondWithContentLocation(
		c,
		fiber.StatusOK,
		"/projects/%s/credentials/%s",
		projectID,
		credentialID,
	)
}

func (s *Server) DeleteCredential(c *fiber.Ctx, _ gen.UUID, credentialID gen.UUID) error {
	err := s.app.Commands.RemoveCredential.Handle(c.Context(), command.RemoveCredentialCommand{
		LLMCredentialID: credentialID,
	})
	if err != nil {
		return err
	}
	return s.server.Respond(c, fiber.StatusNoContent, nil)
}

func (s *Server) ListCredentials(c *fiber.Ctx, projectID gen.UUID) error {
	credentials, err := s.app.Queries.ListCredentials.Handle(c.Context(), query.ListCredentialsQuery{
		ProjectID: projectID,
	})
	if err != nil {
		return err
	}
	return s.server.Respond(c, fiber.StatusOK, queryCredentialsToDTOs(credentials))
}
