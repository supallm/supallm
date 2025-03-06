package errs

import (
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = UnauthorizedError{}

// UnauthorizedError is returned when creation fails.
type UnauthorizedError struct {
	Err error `exhaustruct:"optional"`
}

func (e UnauthorizedError) Detail() string {
	return "unauthorized"
}

func (e UnauthorizedError) Error() string {
	if e.Err != nil {
		return e.Err.Error()
	}
	return "unauthorized"
}

// Slug implements problem.
func (e UnauthorizedError) Slug() slug { return SlugUnauthorized }

// Status implements problem.
func (e UnauthorizedError) Status() int { return http.StatusUnauthorized }

// DocURL implements problem.
func (e UnauthorizedError) DocURL() string { return "-" }

// Params implements problem.
func (e UnauthorizedError) Params() map[string]any {
	return map[string]any{"reason": e.Detail()}
}
