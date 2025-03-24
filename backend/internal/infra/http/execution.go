package http

import (
	"net/http"

	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/infra/http/gen"
)

func (s *Server) ListWorkflowExecutions(
	w http.ResponseWriter,
	r *http.Request,
	projectID gen.UUID,
	workflowID string,
) {
	executions, err := s.app.Queries.GetWorkflowExecutions.Handle(r.Context(), query.GetWorkflowExecutionsQuery{
		WorkflowID: workflowID,
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.Respond(w, r, http.StatusOK, queryExecutionsToDTOs(executions))
}

func (s *Server) GetWorkflowExecution(
	w http.ResponseWriter,
	r *http.Request,
	projectID gen.UUID,
	workflowID string,
	triggerID gen.UUID,
) {
	execution, err := s.app.Queries.GetTriggerExecution.Handle(r.Context(), query.GetTriggerExecutionQuery{
		WorkflowID: workflowID,
		TriggerID:  triggerID,
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.Respond(w, r, http.StatusOK, queryExecutionToDTO(execution))
}
