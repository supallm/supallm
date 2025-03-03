package logger

import (
	"context"

	"github.com/google/uuid"
)

type ctxKey int

const (
	correlationIDKey ctxKey = iota
)

func generateCorrelationID() string {
	// add "gen_" prefix to distinguish generated correlation IDs from correlation IDs passed by the client
	// it's useful to detect if correlation ID was not passed properly
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
