package http

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/command"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/infra/http/gen"
	"github.com/supallm/core/internal/pkg/secret"
)

func (s *Server) CreateCredential(w http.ResponseWriter, r *http.Request, projectID gen.UUID) {
	var req gen.CreateCredentialRequest
	if err := s.server.ParseBody(r, &req); err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	id := uuid.New()
	err := s.app.Commands.AddCredential.Handle(r.Context(), command.AddCredentialCommand{
		ID:           id,
		ProjectID:    projectID,
		Name:         req.Name,
		ProviderType: model.ProviderType(req.Provider),
		APIKey:       secret.APIKey(req.ApiKey),
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.RespondWithContentLocation(w, r, fiber.StatusCreated, "/projects/%s/credentials/%s", projectID, id)
}

func (s *Server) GetCredential(w http.ResponseWriter, r *http.Request, projectID gen.UUID, credentialID gen.UUID) {
	credential, err := s.app.Queries.GetCredential.Handle(r.Context(), query.GetCredentialQuery{
		ProjectID:    projectID,
		CredentialID: credentialID,
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.Respond(w, r, fiber.StatusOK, queryCredentialToDTO(credential))
}

func (s *Server) UpdateCredential(w http.ResponseWriter, r *http.Request, projectID gen.UUID, credentialID gen.UUID) {
	var req gen.UpdateCredentialRequest
	if err := s.server.ParseBody(r, &req); err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	err := s.app.Commands.UpdateCredential.Handle(r.Context(), command.UpdateCredentialCommand{
		ID:        credentialID,
		ProjectID: projectID,
		Name:      req.Name,
		APIKey:    secret.APIKey(req.ApiKey),
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.RespondWithContentLocation(w, r, fiber.StatusOK, "/projects/%s/credentials/%s", projectID, credentialID)
}

func (s *Server) DeleteCredential(w http.ResponseWriter, r *http.Request, _ gen.UUID, credentialID gen.UUID) {
	err := s.app.Commands.RemoveCredential.Handle(r.Context(), command.RemoveCredentialCommand{
		LLMCredentialID: credentialID,
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}
	s.server.Respond(w, r, fiber.StatusNoContent, nil)
}

func (s *Server) ListCredentials(w http.ResponseWriter, r *http.Request, projectID gen.UUID) {
	credentials, err := s.app.Queries.ListCredentials.Handle(r.Context(), query.ListCredentialsQuery{
		ProjectID: projectID,
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}
	s.server.Respond(w, r, fiber.StatusOK, queryCredentialsToDTOs(credentials))
}
