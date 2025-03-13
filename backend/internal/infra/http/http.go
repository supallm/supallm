package http

import (
	"github.com/supallm/core/internal/application"
	"github.com/supallm/core/internal/infra/http/gen"
	"github.com/supallm/core/internal/pkg/server"
)

type Server struct {
	server *server.Server
	app    *application.App
}

func AddHandlers(mux *server.Server, app *application.App) {
	s := &Server{
		server: mux,
		app:    app,
	}

	s.listenWorkflowRan()
	h := gen.HandlerWithOptions(s, gen.ChiServerOptions{
		BaseURL: "",
		Middlewares: []gen.MiddlewareFunc{
			gen.MiddlewareFunc(s.server.ClerkAuthMiddleware),
		},
	})
	mux.Router.Mount("/", h)
}
