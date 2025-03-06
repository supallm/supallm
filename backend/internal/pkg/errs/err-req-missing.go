package errs

import (
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = ReqMissingError{}

// ReqMissingError is returned when a request is missing a required field.
type ReqMissingError struct {
	Field string `exhaustruct:"optional"`
}

func (e ReqMissingError) Error() string {
	if e.Field != "" {
		return "missing request." + e.Field
	}
	return "missing request field"
}

// Slug implements problem.
func (e ReqMissingError) Slug() slug { return SlugRequestMissing }

// Status implements problem.
func (e ReqMissingError) Status() int { return http.StatusBadRequest }

// DocURL implements problem.
func (e ReqMissingError) DocURL() string { return "-" }

// Params implements problem.
func (e ReqMissingError) Params() map[string]any {
	return map[string]any{"field": e.Field}
}
