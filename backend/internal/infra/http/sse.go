package http

import (
	"context"
	"encoding/json"
	"net/http"

	watermillHTTP "github.com/ThreeDotsLabs/watermill-http/v2/pkg/http"
	watermillMsg "github.com/ThreeDotsLabs/watermill/message"
)

type workflowSSEAdapter struct{}

func (p workflowSSEAdapter) InitialStreamResponse(_ http.ResponseWriter, r *http.Request) (response any, ok bool) {
	// publisherId := r.Context().Value("publisherId").(string)
	// eventSlug := r.Context().Value("eventSlug").(string)

	// return map[string]any{
	// 	"sync_event": map[string]any{
	// 		"event_slug":   eventSlug,
	// 		"publisher_id": publisherId,
	// 	},
	// }, true

	return "qsdqd", true
}

func (p workflowSSEAdapter) NextStreamResponse(r *http.Request, msg *watermillMsg.Message) (response any, ok bool) {
	// var messageHandled message.EventMessage
	// err := json.Unmarshal(msg.Payload, &messageHandled)
	// if err != nil {
	// 	return nil, false
	// }

	// userId := r.Context().Value("userId").(string)
	// publisherId := r.Context().Value("publisherId").(string)
	// publisherUuid, err := uuid.Parse(publisherId)
	// if err != nil {
	// 	slog.Error("failed to parse publisher id", "error", err)
	// 	return nil, false
	// }

	// eventSlug := r.Context().Value("eventSlug").(string)

	// return messageHandled.Payload, true

	return "qsdqd", true
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
