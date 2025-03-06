package errs

import (
	"fmt"
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = ReqMissingError{}

// ReqMissingError is returned when a request is missing a required field.
type ReqMissingError struct {
	Field string `exhaustruct:"optional"`
	Err   error  `exhaustruct:"optional"`
}

func (e ReqMissingError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s", e.Detail(), e.Err.Error())
	}
	return e.Detail()
}

func (e ReqMissingError) Detail() string {
	if e.Field != "" {
		return fmt.Sprintf("missing request field: %s", e.Field)
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
