package errs

import (
	"fmt"
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = DuplicateError{}

// DuplicateError is returned when a resource already exists.
type DuplicateError struct {
	Resource string `exhaustruct:"optional"`
	ID       any    `exhaustruct:"optional"`
	Err      error  `exhaustruct:"optional"`
}

func (e DuplicateError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s", e.Detail(), e.Err.Error())
	}
	return e.Detail()
}

func (e DuplicateError) Detail() string {
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

// Slug implements problem.
func (e DuplicateError) Slug() slug { return SlugDuplicate }

// Status implements problem.
func (e DuplicateError) Status() int { return http.StatusConflict }

// DocURL implements problem.
func (e DuplicateError) DocURL() string { return "-" }

// Params implements problem.
func (e DuplicateError) Params() map[string]any {
	return map[string]any{"resource": e.Resource, "id": e.ID}
}
