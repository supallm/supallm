package errs

import (
	"net/http"
)

// ensures it implements problem at compile time
var _ problem = ErrUnauthorized{}

// ErrUnauthorized is returned when creation fails
type ErrUnauthorized struct {
	Reason error
}

func (e ErrUnauthorized) Error() string {
	if e.Reason != nil {
		return "unauthorized: " + e.Reason.Error()
	}
	return "unauthorized"
}

// Slug implements problem
func (e ErrUnauthorized) Slug() slug { return SlugUnauthorized }

// Status implements problem
func (e ErrUnauthorized) Status() int { return http.StatusUnauthorized }

// DocURL implements problem
func (e ErrUnauthorized) DocURL() string { return "-" }

// Params implements problem
func (e ErrUnauthorized) Params() map[string]any {
	if e.Reason == nil {
		return nil
	}
	return map[string]any{"reason": e.Reason.Error()}
}
