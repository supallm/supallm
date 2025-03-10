package http

import (
	"github.com/supallm/core/internal/application"
	http "github.com/supallm/core/internal/infra/http/gen"
	"github.com/supallm/core/internal/pkg/server"
)

type Server struct {
	server *server.Server
	app    *application.App
}

func NewServer(mux *server.Server, app *application.App) {
	s := &Server{
		server: mux,
		app:    app,
	}

	// Register API handlers with Clerk authentication
	http.RegisterHandlersWithOptions(mux.App, s, http.FiberServerOptions{
		BaseURL: "",
		Middlewares: []http.MiddlewareFunc{
			s.server.ClerkAuthMiddleware(),
		},
	})
}
