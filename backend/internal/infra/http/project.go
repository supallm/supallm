package http

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/command"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/infra/http/gen"
)

func (s *Server) CreateProject(w http.ResponseWriter, r *http.Request) {
	var req gen.CreateProjectRequest
	if err := s.server.ParseBody(r, &req); err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	projectID := uuid.New()
	err := s.app.Commands.CreateProject.Handle(r.Context(), command.CreateProjectCommand{
		ID:     projectID,
		Name:   req.Name,
		UserID: s.server.GetUserID(r.Context()),
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.Respond(w, r, http.StatusCreated, idResponse{
		ID: projectID,
	})
}

func (s *Server) GetProject(w http.ResponseWriter, r *http.Request, projectID gen.UUID) {
	project, err := s.app.Queries.GetProject.Handle(r.Context(), query.GetProjectQuery{
		ProjectID: projectID,
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.Respond(w, r, http.StatusOK, queryProjectToDTO(project))
}

func (s *Server) UpdateProject(w http.ResponseWriter, r *http.Request, projectID gen.UUID) {
	var req gen.UpdateProjectRequest
	if err := s.server.ParseBody(r, &req); err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	err := s.app.Commands.UpdateProjectName.Handle(r.Context(), command.UpdateProjectNameCommand{
		ProjectID: projectID,
		Name:      req.Name,
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.RespondWithContentLocation(w, r, http.StatusNoContent, "/projects/%s", projectID)
}

func (s *Server) UpdateAuth(w http.ResponseWriter, r *http.Request, projectID gen.UUID) {
	var req gen.UpdateAuthRequest
	if err := s.server.ParseBody(r, &req); err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	err := s.app.Commands.UpdateAuthProvider.Handle(r.Context(), command.UpdateAuthProviderCommand{
		ProjectID:    projectID,
		ProviderType: model.AuthProviderType(req.Provider),
		Config:       req.Config,
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.RespondWithContentLocation(w, r, http.StatusNoContent, "/projects/%s/auth", projectID)
}

func (s *Server) DeleteProject(w http.ResponseWriter, r *http.Request, _ gen.UUID) {
	s.server.Respond(w, r, http.StatusOK, nil)
}

func (s *Server) ListProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := s.app.Queries.ListProjects.Handle(r.Context(), query.ListProjectsQuery{
		UserID: s.server.GetUserID(r.Context()),
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.Respond(w, r, http.StatusOK, queryProjectsToDTOs(projects))
}
