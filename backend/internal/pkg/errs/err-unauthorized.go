package errs

import (
	"net/http"
)

// ensures it implements problem at compile time.
var _ problem = UnauthorizedError{}

// UnauthorizedError is returned when creation fails.
type UnauthorizedError struct {
	Reason error `exhaustruct:"optional"`
}

func (e UnauthorizedError) Error() string {
	if e.Reason != nil {
		return "unauthorized: " + e.Reason.Error()
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
	if e.Reason == nil {
		return nil
	}
	return map[string]any{"reason": e.Reason.Error()}
}
