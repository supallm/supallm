package http

import (
	"github.com/gofiber/fiber/v2"
	openapi_types "github.com/oapi-codegen/runtime/types"
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
		BaseURL: "/",
		Middlewares: []http.MiddlewareFunc{
			s.server.ClerkAuthMiddleware(),
		},
	})
}

func (s *Server) GetAuth(_ *fiber.Ctx, _ openapi_types.UUID) error {
	return nil
}

func (s *Server) UpdateAuth(_ *fiber.Ctx, _ openapi_types.UUID) error {
	return nil
}

func (s *Server) GenerateText(_ *fiber.Ctx, _ openapi_types.UUID) error {
	return nil
}

func (s *Server) StreamText(_ *fiber.Ctx, _ openapi_types.UUID) error {
	return nil
}
