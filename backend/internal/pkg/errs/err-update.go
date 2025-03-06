package errs

import (
	"fmt"
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = UpdateError{}

// UpdateError is returned when an update fails.
type UpdateError struct {
	Entity string `exhaustruct:"optional"`
	Err    error  `exhaustruct:"optional"`
}

func (e UpdateError) Detail() string {
	if e.Entity != "" {
		return fmt.Sprintf("failed to update %s", e.Entity)
	}
	return "update failed"
}

func (e UpdateError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s", e.Detail(), e.Err.Error())
	}
	return e.Detail()
}

// Slug implements problem.
func (e UpdateError) Slug() slug { return SlugUpdate }

// Status implements problem.
func (e UpdateError) Status() int { return http.StatusInternalServerError }

// DocURL implements problem.
func (e UpdateError) DocURL() string { return "-" }

// Params implements problem.
func (e UpdateError) Params() map[string]any {
	if e.Entity == "" {
		return nil
	}
	return map[string]any{"entity": e.Entity}
}
