package errs

import (
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = InternalError{}

// InternalError is returned when creation fails.
type InternalError struct {
	Reason error `exhaustruct:"optional"`
}

func (e InternalError) Error() string {
	if e.Reason != nil {
		return "internal: " + e.Reason.Error()
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
	if e.Reason == nil {
		return nil
	}
	return map[string]any{"reason": e.Reason.Error()}
}
