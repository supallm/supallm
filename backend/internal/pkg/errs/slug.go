package errs

import (
	"errors"
	"log/slog"
)

// slug represents a unique error type that can be detected by the client.
type slug string

// available slugs.
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

// LogLevel returns the log level from an error chain.
func LogLevel(err error) slog.Level {
	switch {
	case errors.Is(err, &NotFoundError{}),
		errors.Is(err, &ReqMissingError{}),
		errors.Is(err, &InvalidError{}),
		errors.Is(err, &DuplicateError{}),
		errors.Is(err, &ConstraintError{}),
		errors.Is(err, &CreateError{}),
		errors.Is(err, &UpdateError{}),
		errors.Is(err, &DeleteError{}):
		return slog.LevelInfo

	default:
		return slog.LevelError
	}
}
