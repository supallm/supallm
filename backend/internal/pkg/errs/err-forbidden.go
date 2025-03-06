package errs

import (
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = ForbiddenError{}

// ForbiddenError is returned when access is forbidden.
type ForbiddenError struct {
	Reason error `exhaustruct:"optional"`
}

func (e ForbiddenError) Error() string {
	if e.Reason != nil {
		return "forbidden: " + e.Reason.Error()
	}
	return "forbidden"
}

// Slug implements problem.
func (e ForbiddenError) Slug() slug { return SlugForbidden }

// Status implements problem.
func (e ForbiddenError) Status() int { return http.StatusForbidden }

// DocURL implements problem.
func (e ForbiddenError) DocURL() string { return "-" }

// Params implements problem.
func (e ForbiddenError) Params() map[string]any {
	if e.Reason == nil {
		return nil
	}
	return map[string]any{"reason": e.Reason.Error()}
}
