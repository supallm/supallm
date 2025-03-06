package errs

import (
	"fmt"
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = CreateError{}

// CreateError is returned when creation fails.
type CreateError struct {
	Entity string `exhaustruct:"optional"`
	Err    error  `exhaustruct:"optional"`
}

func (e CreateError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s", e.Detail(), e.Err.Error())
	}
	return e.Detail()
}

func (e CreateError) Detail() string {
	if e.Entity != "" {
		return fmt.Sprintf("failed to create %s", e.Entity)
	}
	return "creation failed"
}

// Slug implements problem.
func (e CreateError) Slug() slug { return SlugCreate }

// Status implements problem.
func (e CreateError) Status() int { return http.StatusInternalServerError }

// DocURL implements problem.
func (e CreateError) DocURL() string { return "-" }

// Params implements problem.
func (e CreateError) Params() map[string]any {
	if e.Entity == "" {
		return nil
	}
	return map[string]any{"entity": e.Entity}
}
