package errs

import (
	"fmt"
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = NotFoundError{}

// NotFoundError is returned when a resource is not found.
type NotFoundError struct {
	Resource string `exhaustruct:"optional"`
	ID       any    `exhaustruct:"optional"`
	Err      error  `exhaustruct:"optional"`
}

func (e NotFoundError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s", e.Detail(), e.Err.Error())
	}
	return e.Detail()
}

func (e NotFoundError) Detail() string {
	switch {
	case e.Resource != "" && e.ID != nil:
		return fmt.Sprintf("%s %v not found", e.Resource, e.ID)
	case e.Resource == "" && e.ID != nil:
		return fmt.Sprintf("%v not found", e.ID)
	case e.Resource != "" && e.ID == nil:
		return fmt.Sprintf("%s not found", e.Resource)
	default:
		return "not found"
	}
}

// Slug implements problem.
func (e NotFoundError) Slug() slug { return SlugNotFound }

// Status implements problem.
func (e NotFoundError) Status() int { return http.StatusNotFound }

// DocURL implements problem.
func (e NotFoundError) DocURL() string { return "-" }

// Params implements problem.
func (e NotFoundError) Params() map[string]any {
	return map[string]any{"resource": e.Resource, "id": e.ID}
}
