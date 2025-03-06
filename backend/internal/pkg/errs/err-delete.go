package errs

import (
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = DeleteError{}

// DeleteError is returned when a deletion fails.
type DeleteError struct {
	Reason error `exhaustruct:"optional"`
}

func (e DeleteError) Error() string {
	if e.Reason != nil {
		return "deletion: " + e.Reason.Error()
	}
	return "deletion failed"
}

// Slug implements problem.
func (e DeleteError) Slug() slug { return SlugDelete }

// Status implements problem.
func (e DeleteError) Status() int { return http.StatusInternalServerError }

// DocURL implements problem.
func (e DeleteError) DocURL() string { return "-" }

// Params implements problem.
func (e DeleteError) Params() map[string]any {
	if e.Reason == nil {
		return nil
	}
	return map[string]any{"reason": e.Reason.Error()}
}
