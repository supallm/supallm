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

func NewServer(mux *server.Server, app *application.App) *Server {
	return &Server{
		server: mux,
		app:    app,
	}
}

func (s *Server) RegisterRoutes() {
	http.RegisterHandlers(s.server.App, s)
}

func (s *Server) GetAuth(c *fiber.Ctx) error {
	return c.JSON(map[string]string{"status": "not implemented"})
}

func (s *Server) UpdateAuth(c *fiber.Ctx) error {
	return c.JSON(map[string]string{"status": "not implemented"})
}

func (s *Server) GenerateText(c *fiber.Ctx) error {
	return c.JSON(map[string]string{"status": "not implemented"})
}

func (s *Server) ListProviders(c *fiber.Ctx) error {
	return c.JSON(map[string]string{"status": "not implemented"})
}

func (s *Server) CreateProvider(c *fiber.Ctx) error {
	return c.JSON(map[string]string{"status": "not implemented"})
}

func (s *Server) DeleteProvider(c *fiber.Ctx, id openapi_types.UUID) error {
	return c.JSON(map[string]string{"status": "not implemented", "id": id.String()})
}

func (s *Server) GetProvider(c *fiber.Ctx, id openapi_types.UUID) error {
	return c.JSON(map[string]string{"status": "not implemented", "id": id.String()})
}

func (s *Server) StreamText(c *fiber.Ctx) error {
	return c.JSON(map[string]string{"status": "not implemented"})
}

func (s *Server) ListSystemPrompts(c *fiber.Ctx) error {
	return c.JSON(map[string]string{"status": "not implemented"})
}

func (s *Server) CreateSystemPrompt(c *fiber.Ctx) error {
	return c.JSON(map[string]string{"status": "not implemented"})
}
