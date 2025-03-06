package server

import (
	"context"
	"fmt"
	"log/slog"
	"strconv"

	"github.com/gofiber/fiber/v2"
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
			pb.Instance = ctx.Path()

			slog.Error("Request error",
				slog.String("error", err.Error()),
				slog.String("status", strconv.Itoa(pb.Status)),
				slog.String("method", ctx.Method()),
				slog.String("uri", string(ctx.Request().RequestURI())),
				slog.String("request_id", ctx.GetRespHeader("X-Request-ID")),
			)

			err = ctx.Status(pb.Status).JSON(pb)
			if err != nil {
				return ctx.Status(fiber.StatusInternalServerError).SendString("Internal Server Error")
			}

			return nil
		},
	})

	s := &Server{
		App:  app,
		conf: conf,
	}

	s.applyCommonMiddleware()

	return s
}

func (s *Server) Start() error {
	slog.Info("starting HTTP server", slog.String("address", s.Addr()))
	return s.App.Listen(fmt.Sprintf(":%s", s.conf.Server.Port))
}

func (s *Server) ParseBody(c *fiber.Ctx, v any) error {
	if err := c.BodyParser(v); err != nil {
		return errs.InvalidError{
			Reason: "failed to parse body please refer to openapi schema",
			Err:    err,
		}
	}

	return nil
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
func (s *Server) Stop(_ context.Context) error {
	slog.Info("stopping HTTP server")
	return s.App.Shutdown()
}

func (s *Server) Addr() string {
	return fmt.Sprintf(":%s", s.conf.Server.Port)
}
