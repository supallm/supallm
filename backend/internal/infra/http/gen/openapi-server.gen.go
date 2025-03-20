// Package gen provides primitives to interact with the openapi HTTP API.
//
// Code generated by github.com/oapi-codegen/oapi-codegen/v2 version v2.4.1 DO NOT EDIT.
package gen

import (
	"context"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/oapi-codegen/runtime"
)

// ServerInterface represents all server handlers.
type ServerInterface interface {
	// Authenticate a user
	// (POST /login)
	Login(w http.ResponseWriter, r *http.Request)
	// List all projects
	// (GET /projects)
	ListProjects(w http.ResponseWriter, r *http.Request)
	// Create a project
	// (POST /projects)
	CreateProject(w http.ResponseWriter, r *http.Request)
	// Delete a project
	// (DELETE /projects/{projectId})
	DeleteProject(w http.ResponseWriter, r *http.Request, projectId UUID)
	// Get a project by ID
	// (GET /projects/{projectId})
	GetProject(w http.ResponseWriter, r *http.Request, projectId UUID)
	// Update a project
	// (PUT /projects/{projectId})
	UpdateProject(w http.ResponseWriter, r *http.Request, projectId UUID)
	// Update authentication configuration for a project
	// (PUT /projects/{projectId}/auth)
	UpdateAuth(w http.ResponseWriter, r *http.Request, projectId UUID)
	// List all credentials for a project
	// (GET /projects/{projectId}/credentials)
	ListCredentials(w http.ResponseWriter, r *http.Request, projectId UUID)
	// Create a credential for a project
	// (POST /projects/{projectId}/credentials)
	CreateCredential(w http.ResponseWriter, r *http.Request, projectId UUID)
	// Delete a credential
	// (DELETE /projects/{projectId}/credentials/{credentialId})
	DeleteCredential(w http.ResponseWriter, r *http.Request, projectId UUID, credentialId UUID)
	// Get a credential by ID
	// (GET /projects/{projectId}/credentials/{credentialId})
	GetCredential(w http.ResponseWriter, r *http.Request, projectId UUID, credentialId UUID)
	// Update a credential
	// (PATCH /projects/{projectId}/credentials/{credentialId})
	UpdateCredential(w http.ResponseWriter, r *http.Request, projectId UUID, credentialId UUID)
	// List all workflows for a project
	// (GET /projects/{projectId}/workflows)
	ListWorkflows(w http.ResponseWriter, r *http.Request, projectId UUID)
	// Create a workflow for a project
	// (POST /projects/{projectId}/workflows)
	CreateWorkflow(w http.ResponseWriter, r *http.Request, projectId UUID)
	// Delete a workflow
	// (DELETE /projects/{projectId}/workflows/{workflowId})
	DeleteWorkflow(w http.ResponseWriter, r *http.Request, projectId UUID, workflowId string)
	// Get a workflow by ID
	// (GET /projects/{projectId}/workflows/{workflowId})
	GetWorkflow(w http.ResponseWriter, r *http.Request, projectId UUID, workflowId string)
	// Update a workflow
	// (PUT /projects/{projectId}/workflows/{workflowId})
	UpdateWorkflow(w http.ResponseWriter, r *http.Request, projectId UUID, workflowId string)
	// Trigger a workflow
	// (POST /projects/{projectId}/workflows/{workflowId}/trigger)
	TriggerWorkflow(w http.ResponseWriter, r *http.Request, projectId UUID, workflowId string)
}

// Unimplemented server implementation that returns http.StatusNotImplemented for each endpoint.

type Unimplemented struct{}

// Authenticate a user
// (POST /login)
func (_ Unimplemented) Login(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
}

// List all projects
// (GET /projects)
func (_ Unimplemented) ListProjects(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
}

// Create a project
// (POST /projects)
func (_ Unimplemented) CreateProject(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
}

// Delete a project
// (DELETE /projects/{projectId})
func (_ Unimplemented) DeleteProject(w http.ResponseWriter, r *http.Request, projectId UUID) {
	w.WriteHeader(http.StatusNotImplemented)
}

// Get a project by ID
// (GET /projects/{projectId})
func (_ Unimplemented) GetProject(w http.ResponseWriter, r *http.Request, projectId UUID) {
	w.WriteHeader(http.StatusNotImplemented)
}

// Update a project
// (PUT /projects/{projectId})
func (_ Unimplemented) UpdateProject(w http.ResponseWriter, r *http.Request, projectId UUID) {
	w.WriteHeader(http.StatusNotImplemented)
}

// Update authentication configuration for a project
// (PUT /projects/{projectId}/auth)
func (_ Unimplemented) UpdateAuth(w http.ResponseWriter, r *http.Request, projectId UUID) {
	w.WriteHeader(http.StatusNotImplemented)
}

// List all credentials for a project
// (GET /projects/{projectId}/credentials)
func (_ Unimplemented) ListCredentials(w http.ResponseWriter, r *http.Request, projectId UUID) {
	w.WriteHeader(http.StatusNotImplemented)
}

// Create a credential for a project
// (POST /projects/{projectId}/credentials)
func (_ Unimplemented) CreateCredential(w http.ResponseWriter, r *http.Request, projectId UUID) {
	w.WriteHeader(http.StatusNotImplemented)
}

// Delete a credential
// (DELETE /projects/{projectId}/credentials/{credentialId})
func (_ Unimplemented) DeleteCredential(w http.ResponseWriter, r *http.Request, projectId UUID, credentialId UUID) {
	w.WriteHeader(http.StatusNotImplemented)
}

// Get a credential by ID
// (GET /projects/{projectId}/credentials/{credentialId})
func (_ Unimplemented) GetCredential(w http.ResponseWriter, r *http.Request, projectId UUID, credentialId UUID) {
	w.WriteHeader(http.StatusNotImplemented)
}

// Update a credential
// (PATCH /projects/{projectId}/credentials/{credentialId})
func (_ Unimplemented) UpdateCredential(w http.ResponseWriter, r *http.Request, projectId UUID, credentialId UUID) {
	w.WriteHeader(http.StatusNotImplemented)
}

// List all workflows for a project
// (GET /projects/{projectId}/workflows)
func (_ Unimplemented) ListWorkflows(w http.ResponseWriter, r *http.Request, projectId UUID) {
	w.WriteHeader(http.StatusNotImplemented)
}

// Create a workflow for a project
// (POST /projects/{projectId}/workflows)
func (_ Unimplemented) CreateWorkflow(w http.ResponseWriter, r *http.Request, projectId UUID) {
	w.WriteHeader(http.StatusNotImplemented)
}

// Delete a workflow
// (DELETE /projects/{projectId}/workflows/{workflowId})
func (_ Unimplemented) DeleteWorkflow(w http.ResponseWriter, r *http.Request, projectId UUID, workflowId string) {
	w.WriteHeader(http.StatusNotImplemented)
}

// Get a workflow by ID
// (GET /projects/{projectId}/workflows/{workflowId})
func (_ Unimplemented) GetWorkflow(w http.ResponseWriter, r *http.Request, projectId UUID, workflowId string) {
	w.WriteHeader(http.StatusNotImplemented)
}

// Update a workflow
// (PUT /projects/{projectId}/workflows/{workflowId})
func (_ Unimplemented) UpdateWorkflow(w http.ResponseWriter, r *http.Request, projectId UUID, workflowId string) {
	w.WriteHeader(http.StatusNotImplemented)
}

// Trigger a workflow
// (POST /projects/{projectId}/workflows/{workflowId}/trigger)
func (_ Unimplemented) TriggerWorkflow(w http.ResponseWriter, r *http.Request, projectId UUID, workflowId string) {
	w.WriteHeader(http.StatusNotImplemented)
}

// ServerInterfaceWrapper converts contexts to parameters.
type ServerInterfaceWrapper struct {
	Handler            ServerInterface
	HandlerMiddlewares []MiddlewareFunc
	ErrorHandlerFunc   func(w http.ResponseWriter, r *http.Request, err error)
}

type MiddlewareFunc func(http.Handler) http.Handler

// Login operation middleware
func (siw *ServerInterfaceWrapper) Login(w http.ResponseWriter, r *http.Request) {

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.Login(w, r)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// ListProjects operation middleware
func (siw *ServerInterfaceWrapper) ListProjects(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.ListProjects(w, r)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// CreateProject operation middleware
func (siw *ServerInterfaceWrapper) CreateProject(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.CreateProject(w, r)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// DeleteProject operation middleware
func (siw *ServerInterfaceWrapper) DeleteProject(w http.ResponseWriter, r *http.Request) {

	var err error

	// ------------- Path parameter "projectId" -------------
	var projectId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "projectId", chi.URLParam(r, "projectId"), &projectId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "projectId", Err: err})
		return
	}

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.DeleteProject(w, r, projectId)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// GetProject operation middleware
func (siw *ServerInterfaceWrapper) GetProject(w http.ResponseWriter, r *http.Request) {

	var err error

	// ------------- Path parameter "projectId" -------------
	var projectId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "projectId", chi.URLParam(r, "projectId"), &projectId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "projectId", Err: err})
		return
	}

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.GetProject(w, r, projectId)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// UpdateProject operation middleware
func (siw *ServerInterfaceWrapper) UpdateProject(w http.ResponseWriter, r *http.Request) {

	var err error

	// ------------- Path parameter "projectId" -------------
	var projectId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "projectId", chi.URLParam(r, "projectId"), &projectId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "projectId", Err: err})
		return
	}

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.UpdateProject(w, r, projectId)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// UpdateAuth operation middleware
func (siw *ServerInterfaceWrapper) UpdateAuth(w http.ResponseWriter, r *http.Request) {

	var err error

	// ------------- Path parameter "projectId" -------------
	var projectId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "projectId", chi.URLParam(r, "projectId"), &projectId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "projectId", Err: err})
		return
	}

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.UpdateAuth(w, r, projectId)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// ListCredentials operation middleware
func (siw *ServerInterfaceWrapper) ListCredentials(w http.ResponseWriter, r *http.Request) {

	var err error

	// ------------- Path parameter "projectId" -------------
	var projectId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "projectId", chi.URLParam(r, "projectId"), &projectId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "projectId", Err: err})
		return
	}

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.ListCredentials(w, r, projectId)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// CreateCredential operation middleware
func (siw *ServerInterfaceWrapper) CreateCredential(w http.ResponseWriter, r *http.Request) {

	var err error

	// ------------- Path parameter "projectId" -------------
	var projectId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "projectId", chi.URLParam(r, "projectId"), &projectId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "projectId", Err: err})
		return
	}

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.CreateCredential(w, r, projectId)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// DeleteCredential operation middleware
func (siw *ServerInterfaceWrapper) DeleteCredential(w http.ResponseWriter, r *http.Request) {

	var err error

	// ------------- Path parameter "projectId" -------------
	var projectId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "projectId", chi.URLParam(r, "projectId"), &projectId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "projectId", Err: err})
		return
	}

	// ------------- Path parameter "credentialId" -------------
	var credentialId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "credentialId", chi.URLParam(r, "credentialId"), &credentialId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "credentialId", Err: err})
		return
	}

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.DeleteCredential(w, r, projectId, credentialId)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// GetCredential operation middleware
func (siw *ServerInterfaceWrapper) GetCredential(w http.ResponseWriter, r *http.Request) {

	var err error

	// ------------- Path parameter "projectId" -------------
	var projectId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "projectId", chi.URLParam(r, "projectId"), &projectId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "projectId", Err: err})
		return
	}

	// ------------- Path parameter "credentialId" -------------
	var credentialId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "credentialId", chi.URLParam(r, "credentialId"), &credentialId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "credentialId", Err: err})
		return
	}

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.GetCredential(w, r, projectId, credentialId)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// UpdateCredential operation middleware
func (siw *ServerInterfaceWrapper) UpdateCredential(w http.ResponseWriter, r *http.Request) {

	var err error

	// ------------- Path parameter "projectId" -------------
	var projectId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "projectId", chi.URLParam(r, "projectId"), &projectId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "projectId", Err: err})
		return
	}

	// ------------- Path parameter "credentialId" -------------
	var credentialId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "credentialId", chi.URLParam(r, "credentialId"), &credentialId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "credentialId", Err: err})
		return
	}

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.UpdateCredential(w, r, projectId, credentialId)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// ListWorkflows operation middleware
func (siw *ServerInterfaceWrapper) ListWorkflows(w http.ResponseWriter, r *http.Request) {

	var err error

	// ------------- Path parameter "projectId" -------------
	var projectId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "projectId", chi.URLParam(r, "projectId"), &projectId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "projectId", Err: err})
		return
	}

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.ListWorkflows(w, r, projectId)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// CreateWorkflow operation middleware
func (siw *ServerInterfaceWrapper) CreateWorkflow(w http.ResponseWriter, r *http.Request) {

	var err error

	// ------------- Path parameter "projectId" -------------
	var projectId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "projectId", chi.URLParam(r, "projectId"), &projectId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "projectId", Err: err})
		return
	}

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.CreateWorkflow(w, r, projectId)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// DeleteWorkflow operation middleware
func (siw *ServerInterfaceWrapper) DeleteWorkflow(w http.ResponseWriter, r *http.Request) {

	var err error

	// ------------- Path parameter "projectId" -------------
	var projectId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "projectId", chi.URLParam(r, "projectId"), &projectId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "projectId", Err: err})
		return
	}

	// ------------- Path parameter "workflowId" -------------
	var workflowId string

	err = runtime.BindStyledParameterWithOptions("simple", "workflowId", chi.URLParam(r, "workflowId"), &workflowId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "workflowId", Err: err})
		return
	}

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.DeleteWorkflow(w, r, projectId, workflowId)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// GetWorkflow operation middleware
func (siw *ServerInterfaceWrapper) GetWorkflow(w http.ResponseWriter, r *http.Request) {

	var err error

	// ------------- Path parameter "projectId" -------------
	var projectId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "projectId", chi.URLParam(r, "projectId"), &projectId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "projectId", Err: err})
		return
	}

	// ------------- Path parameter "workflowId" -------------
	var workflowId string

	err = runtime.BindStyledParameterWithOptions("simple", "workflowId", chi.URLParam(r, "workflowId"), &workflowId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "workflowId", Err: err})
		return
	}

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.GetWorkflow(w, r, projectId, workflowId)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// UpdateWorkflow operation middleware
func (siw *ServerInterfaceWrapper) UpdateWorkflow(w http.ResponseWriter, r *http.Request) {

	var err error

	// ------------- Path parameter "projectId" -------------
	var projectId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "projectId", chi.URLParam(r, "projectId"), &projectId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "projectId", Err: err})
		return
	}

	// ------------- Path parameter "workflowId" -------------
	var workflowId string

	err = runtime.BindStyledParameterWithOptions("simple", "workflowId", chi.URLParam(r, "workflowId"), &workflowId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "workflowId", Err: err})
		return
	}

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.UpdateWorkflow(w, r, projectId, workflowId)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

// TriggerWorkflow operation middleware
func (siw *ServerInterfaceWrapper) TriggerWorkflow(w http.ResponseWriter, r *http.Request) {

	var err error

	// ------------- Path parameter "projectId" -------------
	var projectId UUID

	err = runtime.BindStyledParameterWithOptions("simple", "projectId", chi.URLParam(r, "projectId"), &projectId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "projectId", Err: err})
		return
	}

	// ------------- Path parameter "workflowId" -------------
	var workflowId string

	err = runtime.BindStyledParameterWithOptions("simple", "workflowId", chi.URLParam(r, "workflowId"), &workflowId, runtime.BindStyledParameterOptions{ParamLocation: runtime.ParamLocationPath, Explode: false, Required: true})
	if err != nil {
		siw.ErrorHandlerFunc(w, r, &InvalidParamFormatError{ParamName: "workflowId", Err: err})
		return
	}

	ctx := r.Context()

	ctx = context.WithValue(ctx, BearerAuthScopes, []string{})

	r = r.WithContext(ctx)

	handler := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		siw.Handler.TriggerWorkflow(w, r, projectId, workflowId)
	}))

	for _, middleware := range siw.HandlerMiddlewares {
		handler = middleware(handler)
	}

	handler.ServeHTTP(w, r)
}

type UnescapedCookieParamError struct {
	ParamName string
	Err       error
}

func (e *UnescapedCookieParamError) Error() string {
	return fmt.Sprintf("error unescaping cookie parameter '%s'", e.ParamName)
}

func (e *UnescapedCookieParamError) Unwrap() error {
	return e.Err
}

type UnmarshalingParamError struct {
	ParamName string
	Err       error
}

func (e *UnmarshalingParamError) Error() string {
	return fmt.Sprintf("Error unmarshaling parameter %s as JSON: %s", e.ParamName, e.Err.Error())
}

func (e *UnmarshalingParamError) Unwrap() error {
	return e.Err
}

type RequiredParamError struct {
	ParamName string
}

func (e *RequiredParamError) Error() string {
	return fmt.Sprintf("Query argument %s is required, but not found", e.ParamName)
}

type RequiredHeaderError struct {
	ParamName string
	Err       error
}

func (e *RequiredHeaderError) Error() string {
	return fmt.Sprintf("Header parameter %s is required, but not found", e.ParamName)
}

func (e *RequiredHeaderError) Unwrap() error {
	return e.Err
}

type InvalidParamFormatError struct {
	ParamName string
	Err       error
}

func (e *InvalidParamFormatError) Error() string {
	return fmt.Sprintf("Invalid format for parameter %s: %s", e.ParamName, e.Err.Error())
}

func (e *InvalidParamFormatError) Unwrap() error {
	return e.Err
}

type TooManyValuesForParamError struct {
	ParamName string
	Count     int
}

func (e *TooManyValuesForParamError) Error() string {
	return fmt.Sprintf("Expected one value for %s, got %d", e.ParamName, e.Count)
}

// Handler creates http.Handler with routing matching OpenAPI spec.
func Handler(si ServerInterface) http.Handler {
	return HandlerWithOptions(si, ChiServerOptions{})
}

type ChiServerOptions struct {
	BaseURL          string
	BaseRouter       chi.Router
	Middlewares      []MiddlewareFunc
	ErrorHandlerFunc func(w http.ResponseWriter, r *http.Request, err error)
}

// HandlerFromMux creates http.Handler with routing matching OpenAPI spec based on the provided mux.
func HandlerFromMux(si ServerInterface, r chi.Router) http.Handler {
	return HandlerWithOptions(si, ChiServerOptions{
		BaseRouter: r,
	})
}

func HandlerFromMuxWithBaseURL(si ServerInterface, r chi.Router, baseURL string) http.Handler {
	return HandlerWithOptions(si, ChiServerOptions{
		BaseURL:    baseURL,
		BaseRouter: r,
	})
}

// HandlerWithOptions creates http.Handler with additional options
func HandlerWithOptions(si ServerInterface, options ChiServerOptions) http.Handler {
	r := options.BaseRouter

	if r == nil {
		r = chi.NewRouter()
	}
	if options.ErrorHandlerFunc == nil {
		options.ErrorHandlerFunc = func(w http.ResponseWriter, r *http.Request, err error) {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
	}
	wrapper := ServerInterfaceWrapper{
		Handler:            si,
		HandlerMiddlewares: options.Middlewares,
		ErrorHandlerFunc:   options.ErrorHandlerFunc,
	}

	r.Group(func(r chi.Router) {
		r.Post(options.BaseURL+"/login", wrapper.Login)
	})
	r.Group(func(r chi.Router) {
		r.Get(options.BaseURL+"/projects", wrapper.ListProjects)
	})
	r.Group(func(r chi.Router) {
		r.Post(options.BaseURL+"/projects", wrapper.CreateProject)
	})
	r.Group(func(r chi.Router) {
		r.Delete(options.BaseURL+"/projects/{projectId}", wrapper.DeleteProject)
	})
	r.Group(func(r chi.Router) {
		r.Get(options.BaseURL+"/projects/{projectId}", wrapper.GetProject)
	})
	r.Group(func(r chi.Router) {
		r.Put(options.BaseURL+"/projects/{projectId}", wrapper.UpdateProject)
	})
	r.Group(func(r chi.Router) {
		r.Put(options.BaseURL+"/projects/{projectId}/auth", wrapper.UpdateAuth)
	})
	r.Group(func(r chi.Router) {
		r.Get(options.BaseURL+"/projects/{projectId}/credentials", wrapper.ListCredentials)
	})
	r.Group(func(r chi.Router) {
		r.Post(options.BaseURL+"/projects/{projectId}/credentials", wrapper.CreateCredential)
	})
	r.Group(func(r chi.Router) {
		r.Delete(options.BaseURL+"/projects/{projectId}/credentials/{credentialId}", wrapper.DeleteCredential)
	})
	r.Group(func(r chi.Router) {
		r.Get(options.BaseURL+"/projects/{projectId}/credentials/{credentialId}", wrapper.GetCredential)
	})
	r.Group(func(r chi.Router) {
		r.Patch(options.BaseURL+"/projects/{projectId}/credentials/{credentialId}", wrapper.UpdateCredential)
	})
	r.Group(func(r chi.Router) {
		r.Get(options.BaseURL+"/projects/{projectId}/workflows", wrapper.ListWorkflows)
	})
	r.Group(func(r chi.Router) {
		r.Post(options.BaseURL+"/projects/{projectId}/workflows", wrapper.CreateWorkflow)
	})
	r.Group(func(r chi.Router) {
		r.Delete(options.BaseURL+"/projects/{projectId}/workflows/{workflowId}", wrapper.DeleteWorkflow)
	})
	r.Group(func(r chi.Router) {
		r.Get(options.BaseURL+"/projects/{projectId}/workflows/{workflowId}", wrapper.GetWorkflow)
	})
	r.Group(func(r chi.Router) {
		r.Put(options.BaseURL+"/projects/{projectId}/workflows/{workflowId}", wrapper.UpdateWorkflow)
	})
	r.Group(func(r chi.Router) {
		r.Post(options.BaseURL+"/projects/{projectId}/workflows/{workflowId}/trigger", wrapper.TriggerWorkflow)
	})

	return r
}
