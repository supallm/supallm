package http

import (
	"encoding/json"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/command"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/infra/http/gen"
	"github.com/supallm/core/internal/pkg/errs"
)

func (s *Server) CreateWorkflow(c *fiber.Ctx, projectID gen.UUID) error {
	var req gen.CreateWorkflowRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	builderFlow, err := json.Marshal(req.BuilderFlow)
	if err != nil {
		return errs.InvalidError{Reason: "unable to marshal builder flow", Err: err}
	}

	id := uuid.New()
	err = s.app.Commands.AddWorkflow.Handle(c.Context(), command.AddWorkflowCommand{
		ProjectID:   projectID,
		WorkflowID:  id,
		Name:        req.Name,
		BuilderFlow: builderFlow,
	})
	if err != nil {
		return err
	}

	return s.server.RespondWithContentLocation(c, fiber.StatusCreated, "/projects/%s/workflows/%s", projectID, id)
}

func (s *Server) GetWorkflow(c *fiber.Ctx, projectID gen.UUID, workflowID string) error {
	workflow, err := s.app.Queries.GetWorkflow.Handle(c.Context(), query.GetWorkflowQuery{
		ProjectID:  projectID,
		WorkflowID: uuid.MustParse(workflowID),
	})
	if err != nil {
		return err
	}

	return s.server.Respond(c, fiber.StatusOK, queryWorkflowToDTO(workflow))
}

func (s *Server) UpdateWorkflow(c *fiber.Ctx, projectID gen.UUID, workflowID string) error {
	var req gen.UpdateWorkflowRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	builderFlow, err := json.Marshal(req.BuilderFlow)
	if err != nil {
		return errs.InvalidError{Reason: "unable to marshal builder flow", Err: err}
	}

	err = s.app.Commands.UpdateWorkflow.Handle(c.Context(), command.UpdateWorkflowCommand{
		ProjectID:   projectID,
		WorkflowID:  uuid.MustParse(workflowID),
		Name:        req.Name,
		BuilderFlow: builderFlow,
	})
	if err != nil {
		return err
	}

	return s.server.RespondWithContentLocation(
		c,
		fiber.StatusNoContent,
		"/projects/%s/workflows/%s",
		projectID,
		workflowID,
	)
}

func (s *Server) DeleteWorkflow(c *fiber.Ctx, projectID gen.UUID, workflowID gen.UUID) error {
	err := s.app.Commands.RemoveWorkflow.Handle(c.Context(), command.RemoveWorkflowCommand{
		ProjectID:  projectID,
		WorkflowID: workflowID,
	})
	if err != nil {
		return err
	}

	return s.server.Respond(c, fiber.StatusNoContent, nil)
}

func (s *Server) ListWorkflows(c *fiber.Ctx, projectID gen.UUID) error {
	workflows, err := s.app.Queries.ListWorkflows.Handle(c.Context(), query.ListWorkflowsQuery{
		ProjectID: projectID,
	})
	if err != nil {
		return err
	}
	return s.server.Respond(c, fiber.StatusOK, queryWorkflowsToDTOs(workflows))
}

func (s *Server) TriggerWorkflow(c *fiber.Ctx, projectID gen.UUID, workflowID gen.UUID) error {
	var req gen.TriggerWorkflowRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	triggerID := uuid.New()
	err := s.app.Commands.TriggerWorkflow.Handle(c.Context(), command.TriggerWorkflowCommand{
		ProjectID:  projectID,
		WorkflowID: workflowID,
		TriggerID:  triggerID,
		Inputs:     req.Inputs,
	})
	if err != nil {
		return err
	}

	return s.server.RespondWithContentLocation(
		c, fiber.StatusAccepted, "/projects/%s/workflows/%s/triggers/%s", projectID, workflowID, triggerID)
}
