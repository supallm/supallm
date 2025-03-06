package errs

import (
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = CreateError{}

// CreateError is returned when creation fails.
type CreateError struct {
	Reason error `exhaustruct:"optional"`
}

func (e CreateError) Error() string {
	if e.Reason != nil {
		return "creation: " + e.Reason.Error()
	}
	return "creation failed"
}

// Slug implements problem.
func (e CreateError) Slug() slug { return SlugCreate }

// Status implements problem.
func (e CreateError) Status() int { return http.StatusInternalServerError }

// DocURL implements problem.
func (e CreateError) DocURL() string { return "-" }

// Params implements problem.
func (e CreateError) Params() map[string]any {
	if e.Reason == nil {
		return nil
	}
	return map[string]any{"reason": e.Reason.Error()}
}
