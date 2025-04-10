package http

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"sync"

	watermillHTTP "github.com/ThreeDotsLabs/watermill-http/v2/pkg/http"
	watermillMsg "github.com/ThreeDotsLabs/watermill/message"
	"github.com/go-chi/chi/v5"
	"github.com/supallm/core/internal/application/event"
)

func (s *Server) listenWorkflowEvents(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		projectID, err := s.server.ParseUUID(r, "projectId")
		if err != nil {
			s.server.RespondErr(w, r, err)
			return
		}

		err = s.isAuthorize(r.Context(), projectID, s.app.Commands.AuthorizeEventSubscription.Handle)
		if err != nil {
			s.server.RespondErr(w, r, err)
			return
		}

		next.ServeHTTP(w, r)
	}
}

type connectionParams struct {
	triggerID  string
	workflowID string
	projectID  string
}

type workflowSSEAdapter struct {
	connections sync.Map // map[*http.Request]*connectionParams
}

func (p *workflowSSEAdapter) InitialStreamResponse(w http.ResponseWriter, r *http.Request) (response any, ok bool) {
	params := &connectionParams{
		triggerID:  chi.URLParam(r, "triggerId"),
		workflowID: chi.URLParam(r, "workflowId"),
		projectID:  chi.URLParam(r, "projectId"),
	}

	p.connections.Store(r, params)

	return map[string]any{
		"trigger_id":  params.triggerID,
		"workflow_id": params.workflowID,
		"project_id":  params.projectID,
	}, true
}

func (p *workflowSSEAdapter) NextStreamResponse(r *http.Request, msg *watermillMsg.Message) (response any, ok bool) {
	var messageHandled event.WorkflowEventMessage
	err := json.Unmarshal(msg.Payload, &messageHandled)
	if err != nil {
		slog.Error("error unmarshalling workflow event message", "error", err)
		return nil, false
	}

	params, ok := p.connections.Load(r)
	if !ok {
		slog.Error("connection parameters not found")
		return nil, false
	}

	connParams, ok := params.(*connectionParams)
	if !ok {
		slog.Error("connection parameters not found")
		return nil, false
	}

	if messageHandled.TriggerID.String() != connParams.triggerID {
		return nil, false
	}

	return messageHandled, true
}

type workflowSSEMarshaller struct{}

func (j workflowSSEMarshaller) Marshal(_ context.Context, payload any) (watermillHTTP.ServerSentEvent, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return watermillHTTP.ServerSentEvent{}, err
	}

	return watermillHTTP.ServerSentEvent{
		Event: "data",
		Data:  data,
	}, nil
}
