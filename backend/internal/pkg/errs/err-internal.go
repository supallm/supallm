package errs

import (
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = InternalError{}

// InternalError is returned when creation fails.
type InternalError struct {
	Err error `exhaustruct:"optional"`
}

func (e InternalError) Detail() string {
	return "internal error"
}

func (e InternalError) Error() string {
	if e.Err != nil {
		return e.Err.Error()
	}
	return "internal error"
}

// Slug implements problem.
func (e InternalError) Slug() slug { return SlugInternal }

// Status implements problem.
func (e InternalError) Status() int { return http.StatusInternalServerError }

// DocURL implements problem.
func (e InternalError) DocURL() string { return "-" }

// Params implements problem.
func (e InternalError) Params() map[string]any {
	return map[string]any{"reason": e.Detail()}
}
