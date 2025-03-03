package errs

import (
	"encoding/json"
	"errors"
	"net/http"
)

// problem represents a unique error type that can be detected by the client
// according to RFC 7807
type problem interface {
	// Error() used for logs and as the human-readable error 'detail'
	error

	// unique error slug 'title'
	Slug() slug
	// original http status code 'status'
	Status() int
	// URL to the error documentation 'type'
	DocURL() string
	// additional error details 'params'
	Params() map[string]any
}

// ProblemJSON is the RFC 7807 JSON representation of a Problem
type ProblemJSON struct {
	Type     string         `json:"type"`
	Title    string         `json:"title"`
	Status   int            `json:"status"`
	Detail   string         `json:"detail"`
	Instance string         `json:"instance"`
	Params   map[string]any `json:"params"`
}

// extract returns a problem from an error chain
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

var unknownProblem = ProblemJSON{
	Type:   "-",
	Title:  string(SlugUnknown),
	Status: http.StatusInternalServerError,
	Detail: "unknown error",
}

// Problem extracts the ProblemJSON from an error chain.
// Only returns nil if the error is nil
//
// # Can be used as a serialization between proxies
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
		Detail:   pb.Error(),
		Params:   pb.Params(),
		Instance: "", // filled by *http.Request.RequestURI in HTTP()
	}
}

// HTTPStatus returns the HTTP status code of the problem
func (pb *ProblemJSON) HTTPStatus() int {
	if pb.Status == 0 {
		return http.StatusInternalServerError
	}
	return pb.Status
}

// HTTPHeaders returns the HTTP headers to set for the problem
func (pb *ProblemJSON) HTTPHeaders() http.Header {
	return http.Header{
		"Content-Type": {"application/problem+json"},
	}
}

// HTTP writes the problem JSON to the response writer from an error chain
// Compliant with RFC 7807
func HTTP(w http.ResponseWriter, r *http.Request, err error) {
	pb := Problem(err)
	if pb == nil {
		return
	}

	// fill in the instance with the request path
	pb.Instance = r.RequestURI
	for k, vv := range pb.HTTPHeaders() {
		for _, v := range vv {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(pb.HTTPStatus())
	if err := json.NewEncoder(w).Encode(pb); err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}
}
