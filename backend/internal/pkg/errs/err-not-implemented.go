package errs

import (
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = NotImplementedError{}

// NotImplementedError is returned when a constraint blocks the request.
type NotImplementedError struct{}

func (e NotImplementedError) Error() string { return "not implemented" }

func (e NotImplementedError) Detail() string { return "not implemented" }

// Slug implements problem.
func (e NotImplementedError) Slug() slug { return SlugNotImplemented }

// Status implements problem.
func (e NotImplementedError) Status() int { return http.StatusNotImplemented }

// DocURL implements problem.
func (e NotImplementedError) DocURL() string { return "-" }

// Params implements problem.
func (e NotImplementedError) Params() map[string]any {
	return nil
}
