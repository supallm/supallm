package errs

import (
	"fmt"
	"net/http"
)

// ensures it implements problem at compile time
var _ problem = ErrReqInvalid{}

// ErrReqInvalid is returned when a request has an invalid field.
// When the field is omitted the error is considered global (i.e. bad request)
type ErrReqInvalid struct {
	Field  string
	Reason string
}

func (e ErrReqInvalid) Error() string {
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

// Slug implements problem
func (e ErrReqInvalid) Slug() slug { return SlugRequestInvalid }

// Status implements problem
func (e ErrReqInvalid) Status() int { return http.StatusBadRequest }

// DocURL implements problem
func (e ErrReqInvalid) DocURL() string { return "-" }

// Params implements problem
func (e ErrReqInvalid) Params() map[string]any {
	return map[string]any{"field": e.Field, "reason": e.Reason}
}
