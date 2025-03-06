package errs

import (
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = UpdateError{}

// UpdateError is returned when an update fails.
type UpdateError struct {
	Reason error `exhaustruct:"optional"`
}

func (e UpdateError) Error() string {
	if e.Reason != nil {
		return "update: " + e.Reason.Error()
	}
	return "update failed"
}

// Slug implements problem.
func (e UpdateError) Slug() slug { return SlugUpdate }

// Status implements problem.
func (e UpdateError) Status() int { return http.StatusInternalServerError }

// DocURL implements problem.
func (e UpdateError) DocURL() string { return "-" }

// Params implements problem.
func (e UpdateError) Params() map[string]any {
	if e.Reason == nil {
		return nil
	}
	return map[string]any{"reason": e.Reason.Error()}
}
