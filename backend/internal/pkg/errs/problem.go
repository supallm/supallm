package errs

import (
	"errors"
	"net/http"
)

// problem represents a unique error type that can be detected by the client
// according to RFC 7807.
type problem interface {
	// Error() used for logs and as the human-readable error 'detail'.
	error

	// unique error slug 'title'.
	Slug() slug

	// public detail for the client
	Detail() string

	// original http status code 'status'.
	Status() int

	// URL to the error documentation 'type'.
	DocURL() string

	// additional error details 'params'.
	Params() map[string]any
}

// ProblemJSON is the RFC 7807 JSON representation of a Problem.
type ProblemJSON struct {
	Type     string         `json:"type"`
	Title    string         `json:"title"`
	Status   int            `json:"status"`
	Detail   string         `json:"detail"`
	Instance string         `json:"instance" exhaustruct:"optional"`
	Params   map[string]any `json:"params" exhaustruct:"optional"`
}

// extract returns a problem from an error chain.
func extract(err error) problem {
	if err == nil {
		return nil
	}
	var pb problem
	if errors.As(err, &pb) {
		return pb
	}
	return nil
}

//nolint:gochecknoglobals // it's ok
var unknownProblem = ProblemJSON{
	Type:   "-",
	Title:  string(SlugUnknown),
	Status: http.StatusInternalServerError,
	Detail: "unknown error",
}

// Problem extracts the ProblemJSON from an error chain.
// Only returns nil if the error is nil.
//
// # Can be used as a serialization between proxies.
func Problem(err error) *ProblemJSON {
	if err == nil {
		return nil
	}

	pb := extract(err)
	if pb == nil {
		return &unknownProblem
	}

	return &ProblemJSON{
		Type:     pb.DocURL(),
		Title:    string(pb.Slug()),
		Status:   pb.Status(),
		Detail:   pb.Detail(),
		Params:   pb.Params(),
		Instance: "", // filled by *http.Request.RequestURI in HTTP()
	}
}

// HTTPStatus returns the HTTP status code of the problem.
func (pb *ProblemJSON) HTTPStatus() int {
	if pb.Status == 0 {
		return http.StatusInternalServerError
	}
	return pb.Status
}

// HTTPHeaders returns the HTTP headers to set for the problem.
func (pb *ProblemJSON) HTTPHeaders() http.Header {
	return http.Header{
		"Content-Type": {"application/problem+json"},
	}
}
