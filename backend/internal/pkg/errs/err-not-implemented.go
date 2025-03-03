package errs

import (
	"net/http"
)

// ensures it implements problem at compile time
var _ problem = ErrNotImplemented{}

// ErrNotImplemented is returned when a constraint blocks the request.
type ErrNotImplemented struct{}

func (e ErrNotImplemented) Error() string { return "not implemented" }

// Slug implements problem
func (e ErrNotImplemented) Slug() slug { return SlugNotImplemented }

// Status implements problem
func (e ErrNotImplemented) Status() int { return http.StatusNotImplemented }

// DocURL implements problem
func (e ErrNotImplemented) DocURL() string { return "-" }

// Params implements problem
func (e ErrNotImplemented) Params() map[string]any {
	return nil
}
