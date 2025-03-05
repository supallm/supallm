package server

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/healthcheck"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/supallm/core/internal/pkg/config"
	"github.com/supallm/core/internal/pkg/errs"
)

type Server struct {
	App  *fiber.App
	conf config.Config
}

func New(conf config.Config) *Server {
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
		ErrorHandler: func(ctx *fiber.Ctx, err error) error {
			pb := errs.Problem(err)

			slog.Error(err.Error(),
				slog.String("status", fmt.Sprintf("%d", pb.Status)),
				slog.String("uri", string(ctx.Request().RequestURI())),
			)

			err = ctx.Status(pb.Status).JSON(pb)
			if err != nil {
				return ctx.Status(fiber.StatusInternalServerError).SendString("Internal Server Error")
			}

			return nil
		},
	})

	// Add middleware
	app.Use(helmet.New())
	app.Use(requestid.New())
	// app.Use(recover.New())
	app.Use(logger.New())
	app.Use(healthcheck.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:  "*",
		AllowMethods:  "GET, POST, PUT, DELETE, OPTIONS",
		AllowHeaders:  "Origin, Content-Type, Accept, Authorization",
		ExposeHeaders: "Content-Location",
	}))

	return &Server{
		App:  app,
		conf: conf,
	}
}

func (s *Server) Start() error {
	return s.App.Listen(fmt.Sprintf(":%s", s.conf.Server.Port))
}

func (s *Server) Respond(c *fiber.Ctx, status int, data any) error {
	if data == nil {
		return c.Status(status).Send(nil)
	}
	return c.Status(status).JSON(data)
}

func (s *Server) RespondWithContentLocation(c *fiber.Ctx, status int, uri string, params ...any) error {
	c.Set("Content-Location", fmt.Sprintf(uri, params...))
	return s.Respond(c, status, nil)
}

func (s *Server) Redirect(c *fiber.Ctx, redirectURL string) error {
	return c.Redirect(redirectURL, fiber.StatusSeeOther)
}

func (s *Server) GetQueryParam(c *fiber.Ctx, key string) string {
	return c.Query(key)
}

func (s *Server) GetParam(c *fiber.Ctx, key string) string {
	return c.Params(key)
}

// Add a Stop method to gracefully shutdown the server
func (s *Server) Stop(ctx context.Context) error {
	slog.Info("stopping HTTP server")
	return s.App.Shutdown()
}

func (s *Server) Addr() string {
	return fmt.Sprintf(":%s", s.conf.Server.Port)
}
