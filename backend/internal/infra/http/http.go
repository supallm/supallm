package http

import (
	"log/slog"
	"os"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-http/v2/pkg/http"
	"github.com/gofiber/fiber/v2/middleware/adaptor"
	"github.com/supallm/core/internal/application"
	"github.com/supallm/core/internal/application/event"
	"github.com/supallm/core/internal/infra/http/gen"
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

	s.listenWorkflowTrigger()
	gen.RegisterHandlersWithOptions(mux.App, s, gen.FiberServerOptions{
		BaseURL: "",
		Middlewares: []gen.MiddlewareFunc{
			s.server.ClerkAuthMiddleware(),
		},
	})
}

func (s *Server) listenWorkflowTrigger() {
	logger := watermill.NewSlogLogger(nil)
	sseRouter, err := http.NewSSERouter(
		http.SSERouterConfig{
			UpstreamSubscriber: s.app.Subscriber,
			ErrorHandler:       http.DefaultErrorHandler,
			Marshaler:          workflowSSEMarshaller{},
		},
		logger,
	)
	if err != nil {
		slog.Error("error creating sse router", "error", err)
		os.Exit(1)
	}

	sseHandler := sseRouter.AddHandler(event.TopicWorkflowEventsOut, workflowSSEAdapter{})
	s.server.App.Get("/projects/:projectId/workflows/:workflowId/listen/:triggerId", adaptor.HTTPHandler(sseHandler))
}
