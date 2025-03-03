package errs

import (
	"errors"
	"log/slog"
)

// slug represents a unique error type that can be detected by the client
type slug string

// available slugs
const (
	SlugNotFound       slug = "not-found"
	SlugRequestMissing slug = "request-missing"
	SlugRequestInvalid slug = "request-invalid"
	SlugUnauthorized   slug = "unauthorized"
	SlugForbidden      slug = "forbidden"
	SlugDuplicate      slug = "already-exists"
	SlugNotImplemented slug = "not-implemented"
	SlugConstraint     slug = "constraint-violation"
	SlugInternal       slug = "internal-error"
	SlugCreate         slug = "create-error"
	SlugUpdate         slug = "update-error"
	SlugDelete         slug = "delete-error"

	SlugUnknown slug = "unknown"
)

// LogLevel returns the log level from an error chain
func LogLevel(err error) slog.Level {
	switch {
	case errors.Is(err, &ErrNotFound{}),
		errors.Is(err, &ErrReqMissing{}),
		errors.Is(err, &ErrReqInvalid{}),
		errors.Is(err, &ErrDuplicate{}),
		errors.Is(err, &ErrConstraint{}),
		errors.Is(err, &ErrCreate{}),
		errors.Is(err, &ErrUpdate{}),
		errors.Is(err, &ErrDelete{}):
		return slog.LevelInfo

	default:
		return slog.LevelError
	}
}
