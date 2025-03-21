package errs

import (
	"fmt"
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = ForbiddenError{}

// ForbiddenError is returned when access is forbidden.
type ForbiddenError struct {
	Entity string `exhaustruct:"optional"`
	Err    error  `exhaustruct:"optional"`
}

func (e ForbiddenError) Error() string {
	if e.Err != nil {
		return e.Err.Error()
	}
	return e.Detail()
}

func (e ForbiddenError) Detail() string {
	if e.Entity != "" {
		return fmt.Sprintf("forbidden to access %s", e.Entity)
	}
	return "forbidden"
}

// Slug implements problem.
func (e ForbiddenError) Slug() slug { return SlugForbidden }

// Status implements problem.
func (e ForbiddenError) Status() int { return http.StatusForbidden }

// DocURL implements problem.
func (e ForbiddenError) DocURL() string { return "-" }

// Params implements problem.
func (e ForbiddenError) Params() map[string]any {
	if e.Entity == "" {
		return nil
	}
	return map[string]any{"entity": e.Entity}
}
