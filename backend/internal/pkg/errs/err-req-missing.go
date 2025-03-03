package errs

import (
	"net/http"
)

// ensures it implements problem at compile time
var _ problem = ErrReqMissing{}

// ErrReqMissing is returned when a request is missing a required field.
type ErrReqMissing struct {
	Field string
}

func (e ErrReqMissing) Error() string {
	if e.Field != "" {
		return "missing request." + e.Field
	}
	return "missing request field"
}

// Slug implements problem
func (e ErrReqMissing) Slug() slug { return SlugRequestMissing }

// Status implements problem
func (e ErrReqMissing) Status() int { return http.StatusBadRequest }

// DocURL implements problem
func (e ErrReqMissing) DocURL() string { return "-" }

// Params implements problem
func (e ErrReqMissing) Params() map[string]any {
	return map[string]any{"field": e.Field}
}
