package http

import (
	"encoding/json"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/command"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/infra/http/gen"
	"github.com/supallm/core/internal/pkg/errs"
)

func (s *Server) CreateWorkflow(w http.ResponseWriter, r *http.Request, projectID gen.UUID) {
	var req gen.CreateWorkflowRequest
	if err := s.server.ParseBody(r, &req); err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	builderFlow, err := json.Marshal(req.BuilderFlow)
	if err != nil {
		s.server.RespondErr(w, r, errs.InvalidError{Reason: "unable to marshal builder flow", Err: err})
		return
	}

	id := uuid.New()
	err = s.app.Commands.AddWorkflow.Handle(r.Context(), command.AddWorkflowCommand{
		ProjectID:   projectID,
		WorkflowID:  id,
		Name:        req.Name,
		BuilderFlow: builderFlow,
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.RespondWithContentLocation(w, r, fiber.StatusCreated, "/projects/%s/workflows/%s", projectID, id)
}

func (s *Server) GetWorkflow(w http.ResponseWriter, r *http.Request, projectID gen.UUID, workflowID string) {
	workflow, err := s.app.Queries.GetWorkflow.Handle(r.Context(), query.GetWorkflowQuery{
		ProjectID:  projectID,
		WorkflowID: uuid.MustParse(workflowID),
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.Respond(w, r, fiber.StatusOK, queryWorkflowToDTO(workflow))
}

func (s *Server) UpdateWorkflow(w http.ResponseWriter, r *http.Request, projectID gen.UUID, workflowID string) {
	var req gen.UpdateWorkflowRequest
	if err := s.server.ParseBody(r, &req); err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	builderFlow, err := json.Marshal(req.BuilderFlow)
	if err != nil {
		s.server.RespondErr(w, r, errs.InvalidError{Reason: "unable to marshal builder flow", Err: err})
		return
	}

	err = s.app.Commands.UpdateWorkflow.Handle(r.Context(), command.UpdateWorkflowCommand{
		ProjectID:   projectID,
		WorkflowID:  uuid.MustParse(workflowID),
		Name:        req.Name,
		BuilderFlow: builderFlow,
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.RespondWithContentLocation(w, r, fiber.StatusNoContent, "/projects/%s/workflows/%s", projectID, workflowID)
}

func (s *Server) DeleteWorkflow(w http.ResponseWriter, r *http.Request, projectID gen.UUID, workflowID gen.UUID) {
	err := s.app.Commands.RemoveWorkflow.Handle(r.Context(), command.RemoveWorkflowCommand{
		ProjectID:  projectID,
		WorkflowID: workflowID,
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.Respond(w, r, fiber.StatusNoContent, nil)
}

func (s *Server) ListWorkflows(w http.ResponseWriter, r *http.Request, projectID gen.UUID) {
	workflows, err := s.app.Queries.ListWorkflows.Handle(r.Context(), query.ListWorkflowsQuery{
		ProjectID: projectID,
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.Respond(w, r, fiber.StatusOK, queryWorkflowsToDTOs(workflows))
}

func (s *Server) TriggerWorkflow(w http.ResponseWriter, r *http.Request, projectID gen.UUID, workflowID gen.UUID) {
	var req gen.TriggerWorkflowRequest
	if err := s.server.ParseBody(r, &req); err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	triggerID := uuid.New()
	err := s.app.Commands.TriggerWorkflow.Handle(r.Context(), command.TriggerWorkflowCommand{
		ProjectID:  projectID,
		WorkflowID: workflowID,
		TriggerID:  triggerID,
		Inputs:     req.Inputs,
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.Respond(w, r, fiber.StatusAccepted, map[string]any{
		"triggerId": triggerID,
	})
}
