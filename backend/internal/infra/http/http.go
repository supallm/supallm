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
		Middlewares: []http.MiddlewareFunc{
			s.server.ClerkAuthMiddleware(),
		},
	})
}

func (s *Server) ListProjects(c *fiber.Ctx) error {
	return s.server.Respond(c, fiber.StatusOK, "Hello, World!")
}

func (s *Server) CreateProject(c *fiber.Ctx) error {
	return nil
}

func (s *Server) DeleteProject(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) GetProject(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) UpdateProject(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) GetAuth(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) UpdateAuth(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) GenerateText(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) ListModels(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) CreateModel(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) DeleteModel(c *fiber.Ctx, projectId openapi_types.UUID, slug string) error {
	return nil
}

func (s *Server) GetModel(c *fiber.Ctx, projectId openapi_types.UUID, slug string) error {
	return nil
}

func (s *Server) UpdateModel(c *fiber.Ctx, projectId openapi_types.UUID, slug string) error {
	return nil
}

func (s *Server) ListProviders(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) CreateProvider(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}

func (s *Server) DeleteProvider(c *fiber.Ctx, projectId openapi_types.UUID, providerId openapi_types.UUID) error {
	return nil
}

func (s *Server) GetProvider(c *fiber.Ctx, projectId openapi_types.UUID, providerId openapi_types.UUID) error {
	return nil
}

func (s *Server) UpdateProvider(c *fiber.Ctx, projectId openapi_types.UUID, providerId openapi_types.UUID) error {
	return nil
}

func (s *Server) StreamText(c *fiber.Ctx, projectId openapi_types.UUID) error {
	return nil
}
