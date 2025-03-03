package errs

import (
	"fmt"
	"net/http"
)

// ensures it implements problem at compile time
var _ problem = ErrNotFound{}

// ErrNotFound is returned when a resource is not found.
type ErrNotFound struct {
	Resource string
	ID       any
}

func (e ErrNotFound) Error() string {
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

// Slug implements problem
func (e ErrNotFound) Slug() slug { return SlugNotFound }

// Status implements problem
func (e ErrNotFound) Status() int { return http.StatusNotFound }

// DocURL implements problem
func (e ErrNotFound) DocURL() string { return "-" }

// Params implements problem
func (e ErrNotFound) Params() map[string]any {
	return map[string]any{"resource": e.Resource, "id": e.ID}
}
