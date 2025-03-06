package errs

import (
	"fmt"
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = ReqInvalidError{}

// ReqInvalidError is returned when a request has an invalid field.
// When the field is omitted the error is considered global (i.e. bad request).
type ReqInvalidError struct {
	Field  string `exhaustruct:"optional"`
	Reason string `exhaustruct:"optional"`
}

func (e ReqInvalidError) Error() string {
	switch {
	case e.Field != "" && e.Reason != "":
		return fmt.Sprintf("invalid request.%s (%s)", e.Field, e.Reason)
	case e.Field == "" && e.Reason != "":
		return fmt.Sprintf("invalid request (%s)", e.Reason)
	case e.Field != "" && e.Reason == "":
		return fmt.Sprintf("invalid request.%s", e.Field)
	default:
		return "invalid request"
	}
}

// Slug implements problem.
func (e ReqInvalidError) Slug() slug { return SlugRequestInvalid }

// Status implements problem.
func (e ReqInvalidError) Status() int { return http.StatusBadRequest }

// DocURL implements problem.
func (e ReqInvalidError) DocURL() string { return "-" }

// Params implements problem.
func (e ReqInvalidError) Params() map[string]any {
	return map[string]any{"field": e.Field, "reason": e.Reason}
}
