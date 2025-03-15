package http

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	watermillHTTP "github.com/ThreeDotsLabs/watermill-http/v2/pkg/http"
	watermillMsg "github.com/ThreeDotsLabs/watermill/message"
	"github.com/go-chi/chi/v5"
	"github.com/supallm/core/internal/application/domain/model"
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

type workflowSSEAdapter struct{}

func (p workflowSSEAdapter) InitialStreamResponse(w http.ResponseWriter, r *http.Request) (response any, ok bool) {
	triggerID := chi.URLParam(r, "triggerId")
	workflowID := chi.URLParam(r, "workflowId")
	projectID := chi.URLParam(r, "projectId")

	return map[string]any{
		"trigger_id":  triggerID,
		"workflow_id": workflowID,
		"project_id":  projectID,
	}, true
}

func (p workflowSSEAdapter) NextStreamResponse(r *http.Request, msg *watermillMsg.Message) (response any, ok bool) {
	var messageHandled event.WorkflowEventMessage
	err := json.Unmarshal(msg.Payload, &messageHandled)
	if err != nil {
		return nil, false
	}

	slog.Info("message handled", "message", messageHandled)
	triggerID := chi.URLParam(r, "triggerId")
	if messageHandled.TriggerID.String() != triggerID {
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

	eventType := "data"
	if msg, ok := payload.(event.WorkflowEventMessage); ok {
		if msg.Type != model.WorkflowEventNodeResult {
			eventType = "workflow"
		}
		if msg.Type == model.WorkflowCompleted {
			eventType = "complete"
		}
	}

	return watermillHTTP.ServerSentEvent{
		Event: eventType,
		Data:  data,
	}, nil
}
