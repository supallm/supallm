package errs

import (
	"fmt"
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = InvalidError{}

// InvalidError is returned when a request has an invalid field.
// When the field is omitted the error is considered global (i.e. bad request).
type InvalidError struct {
	Field  string `exhaustruct:"optional"`
	Reason string `exhaustruct:"optional"`
	Err    error  `exhaustruct:"optional"`
}

func (e InvalidError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s", e.Detail(), e.Err.Error())
	}
	return e.Detail()
}

func (e InvalidError) Detail() string {
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
func (e InvalidError) Slug() slug { return SlugRequestInvalid }

// Status implements problem.
func (e InvalidError) Status() int { return http.StatusBadRequest }

// DocURL implements problem.
func (e InvalidError) DocURL() string { return "-" }

// Params implements problem.
func (e InvalidError) Params() map[string]any {
	return map[string]any{"field": e.Field, "reason": e.Reason}
}
