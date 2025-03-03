package errs

import (
	"net/http"
)

// ensures it implements problem at compile time
var _ problem = ErrUpdate{}

// ErrUpdate is returned when an update fails
type ErrUpdate struct {
	Reason error
}

func (e ErrUpdate) Error() string {
	if e.Reason != nil {
		return "update: " + e.Reason.Error()
	}
	return "update failed"
}

// Slug implements problem
func (e ErrUpdate) Slug() slug { return SlugUpdate }

// Status implements problem
func (e ErrUpdate) Status() int { return http.StatusInternalServerError }

// DocURL implements problem
func (e ErrUpdate) DocURL() string { return "-" }

// Params implements problem
func (e ErrUpdate) Params() map[string]any {
	if e.Reason == nil {
		return nil
	}
	return map[string]any{"reason": e.Reason.Error()}
}
