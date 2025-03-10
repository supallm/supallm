package http

import (
	"github.com/gofiber/fiber/v2"
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

// (GET /projects/{projectId}/workflows/{workflowId}/listen/{triggerId})
func (s *Server) ListenWorkflowTrigger(_ *fiber.Ctx, _ http.UUID, _ http.UUID, _ http.UUID) error {
	return nil
}

// (POST /projects/{projectId}/workflows/{workflowId}/trigger)
func (s *Server) TriggerWorkflow(_ *fiber.Ctx, _ http.UUID, _ http.UUID) error {
	return nil
}
