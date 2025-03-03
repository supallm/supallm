package errs

import (
	"net/http"
)

// ensures it implements problem at compile time
var _ problem = ErrInternal{}

// ErrInternal is returned when creation fails
type ErrInternal struct {
	Reason error
}

func (e ErrInternal) Error() string {
	if e.Reason != nil {
		return "internal: " + e.Reason.Error()
	}
	return "internal error"
}

// Slug implements problem
func (e ErrInternal) Slug() slug { return SlugInternal }

// Status implements problem
func (e ErrInternal) Status() int { return http.StatusInternalServerError }

// DocURL implements problem
func (e ErrInternal) DocURL() string { return "-" }

// Params implements problem
func (e ErrInternal) Params() map[string]any {
	if e.Reason == nil {
		return nil
	}
	return map[string]any{"reason": e.Reason.Error()}
}
