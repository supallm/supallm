package errs

import (
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = ConstraintError{}

// ConstraintError is returned when a constraint blocks the request.
type ConstraintError struct {
	Condition string `exhaustruct:"optional"`
}

func (e ConstraintError) Error() string {
	if e.Condition != "" {
		return "constrain by " + e.Condition
	}
	return "constraint"
}

// Slug implements problem.
func (e ConstraintError) Slug() slug { return SlugConstraint }

// Status implements problem.
func (e ConstraintError) Status() int { return http.StatusConflict }

// DocURL implements problem.
func (e ConstraintError) DocURL() string { return "-" }

// Params implements problem.
func (e ConstraintError) Params() map[string]any {
	return map[string]any{"condition": e.Condition}
}
