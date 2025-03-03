package errs

import (
	"net/http"
)

// ensures it implements problem at compile time
var _ problem = ErrCreate{}

// ErrCreate is returned when creation fails
type ErrCreate struct {
	Reason error
}

func (e ErrCreate) Error() string {
	if e.Reason != nil {
		return "creation: " + e.Reason.Error()
	}
	return "creation failed"
}

// Slug implements problem
func (e ErrCreate) Slug() slug { return SlugCreate }

// Status implements problem
func (e ErrCreate) Status() int { return http.StatusInternalServerError }

// DocURL implements problem
func (e ErrCreate) DocURL() string { return "-" }

// Params implements problem
func (e ErrCreate) Params() map[string]any {
	if e.Reason == nil {
		return nil
	}
	return map[string]any{"reason": e.Reason.Error()}
}
