package event

import (
	"context"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/google/uuid"
)

type ctxKey int

const (
	correlationIDKey                ctxKey = iota
	correlationIDMessageMetadataKey        = "correlation_id"
)

func generateCorrelationID() string {
	// add "gen_" prefix to distinguish generated correlation IDs from correlation IDs
	gen := "gen_" + uuid.New().String()
	return gen
}

func ContextWithCorrelationID(ctx context.Context, correlationID string) context.Context {
	if correlationID == "" {
		correlationID = generateCorrelationID()
	}
	return context.WithValue(ctx, correlationIDKey, correlationID)
}

func CorrelationIDFromContext(ctx context.Context) string {
	v, ok := ctx.Value(correlationIDKey).(string)
	if ok {
		return v
	}

	return generateCorrelationID()
}

func useMiddlewares(router *message.Router, logger watermill.LoggerAdapter, extra ...message.HandlerMiddleware) {
	router.AddMiddleware(func(next message.HandlerFunc) message.HandlerFunc {
		return func(msg *message.Message) (events []*message.Message, err error) {
			correlationID := msg.Metadata.Get(correlationIDMessageMetadataKey)
			msg.SetContext(ContextWithCorrelationID(msg.Context(), correlationID))
			return next(msg)
		}
	})

	router.AddMiddleware(func(h message.HandlerFunc) message.HandlerFunc {
		return func(msg *message.Message) (messages []*message.Message, err error) {
			defer func() {
				if r := recover(); r != nil {
					logger.Error("recovered from panic in message handler", err, nil)
					messages = nil
					err = nil
					return
				}
			}()

			return h(msg)
		}
	})

	router.AddMiddleware(extra...)
}
