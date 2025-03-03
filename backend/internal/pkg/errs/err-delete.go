package errs

import (
	"net/http"
)

// ensures it implements problem at compile time
var _ problem = ErrDelete{}

// ErrDelete is returned when a deletion fails
type ErrDelete struct {
	Reason error
}

func (e ErrDelete) Error() string {
	if e.Reason != nil {
		return "deletion: " + e.Reason.Error()
	}
	return "deletion failed"
}

// Slug implements problem
func (e ErrDelete) Slug() slug { return SlugDelete }

// Status implements problem
func (e ErrDelete) Status() int { return http.StatusInternalServerError }

// DocURL implements problem
func (e ErrDelete) DocURL() string { return "-" }

// Params implements problem
func (e ErrDelete) Params() map[string]any {
	if e.Reason == nil {
		return nil
	}
	return map[string]any{"reason": e.Reason.Error()}
}
