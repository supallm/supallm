package errs

import (
	"net/http"
)

// ensures it implements problem at compile time
var _ problem = ErrConstraint{}

// ErrConstraint is returned when a constraint blocks the request.
type ErrConstraint struct {
	Condition string
}

func (e ErrConstraint) Error() string {
	if e.Condition != "" {
		return "constrain by " + e.Condition
	}
	return "constraint"
}

// Slug implements problem
func (e ErrConstraint) Slug() slug { return SlugConstraint }

// Status implements problem
func (e ErrConstraint) Status() int { return http.StatusConflict }

// DocURL implements problem
func (e ErrConstraint) DocURL() string { return "-" }

// Params implements problem
func (e ErrConstraint) Params() map[string]any {
	return map[string]any{"condition": e.Condition}
}
