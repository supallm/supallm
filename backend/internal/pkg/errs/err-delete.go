package errs

import (
	"fmt"
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = DeleteError{}

// DeleteError is returned when a deletion fails.
type DeleteError struct {
	Entity string `exhaustruct:"optional"`
	Err    error  `exhaustruct:"optional"`
}

func (e DeleteError) Error() string {
	if e.Err != nil {
		return e.Err.Error()
	}
	return e.Detail()
}

func (e DeleteError) Detail() string {
	if e.Entity != "" {
		return fmt.Sprintf("failed to delete %s", e.Entity)
	}
	return "deletion failed"
}

// Slug implements problem.
func (e DeleteError) Slug() slug { return SlugDelete }

// Status implements problem.
func (e DeleteError) Status() int { return http.StatusInternalServerError }

// DocURL implements problem.
func (e DeleteError) DocURL() string { return "-" }

// Params implements problem.
func (e DeleteError) Params() map[string]any {
	if e.Entity == "" {
		return nil
	}
	return map[string]any{"entity": e.Entity}
}
