package errs

import (
	"net/http"
)

// ensures it implements problem at compile time
var _ problem = ErrForbidden{}

// ErrForbidden is returned when access is forbidden.
type ErrForbidden struct {
	Reason error
}

func (e ErrForbidden) Error() string {
	if e.Reason != nil {
		return "forbidden: " + e.Reason.Error()
	}
	return "forbidden"
}

// Slug implements problem
func (e ErrForbidden) Slug() slug { return SlugForbidden }

// Status implements problem
func (e ErrForbidden) Status() int { return http.StatusForbidden }

// DocURL implements problem
func (e ErrForbidden) DocURL() string { return "-" }

// Params implements problem
func (e ErrForbidden) Params() map[string]any {
	if e.Reason == nil {
		return nil
	}
	return map[string]any{"reason": e.Reason.Error()}
}
