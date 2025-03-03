package errs

import (
	"fmt"
	"net/http"
)

// ensures it implements problem at compile time
var _ problem = ErrDuplicate{}

// ErrDuplicate is returned when a resource already exists.
type ErrDuplicate struct {
	Resource string
	ID       any
}

func (e ErrDuplicate) Error() string {
	switch {
	case e.Resource != "" && e.ID != nil:
		return fmt.Sprintf("%s %v already exists", e.Resource, e.ID)
	case e.Resource == "" && e.ID != nil:
		return fmt.Sprintf("%v already exists", e.ID)
	case e.Resource != "" && e.ID == nil:
		return fmt.Sprintf("%s already exists", e.Resource)
	default:
		return "already exists"
	}
}

// Slug implements problem
func (e ErrDuplicate) Slug() slug { return SlugDuplicate }

// Status implements problem
func (e ErrDuplicate) Status() int { return http.StatusConflict }

// DocURL implements problem
func (e ErrDuplicate) DocURL() string { return "-" }

// Params implements problem
func (e ErrDuplicate) Params() map[string]any {
	return map[string]any{"resource": e.Resource, "id": e.ID}
}
