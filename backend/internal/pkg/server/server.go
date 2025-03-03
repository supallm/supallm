package server

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/config"
	"github.com/supallm/core/internal/pkg/errs"
)

type Handler = func(ctx context.Context) error

type Server struct {
	App  *fiber.App
	conf config.Config
}

func New(conf config.Config) *Server {
	app := fiber.New(fiber.Config{
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
	app.Use(requestIDMiddleware)
	app.Use(recoveryMiddleware)

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

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
		return c.SendStatus(status)
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

func (s *Server) GetOriginalURL(c *fiber.Ctx) string {
	scheme := "http"
	if c.Protocol() == "https" {
		scheme = "https"
	}
	return fmt.Sprintf("%s://%s%s", scheme, c.Hostname(), c.OriginalURL())
}

func (s *Server) ParseUUID(c *fiber.Ctx, key string) (uuid.UUID, error) {
	id, err := uuid.Parse(c.Params(key))
	if err != nil {
		return uuid.UUID{}, fmt.Errorf("%w: %w", errs.ErrReqInvalid{
			Field:  key,
			Reason: "invalid uuid",
		}, err)
	}
	return id, nil
}

func requestIDMiddleware(c *fiber.Ctx) error {
	requestID := c.Get(fiber.HeaderXRequestID)
	if requestID == "" {
		requestID = uuid.New().String()
		c.Set(fiber.HeaderXRequestID, requestID)
	}
	return c.Next()
}

func recoveryMiddleware(c *fiber.Ctx) error {
	defer func() {
		if r := recover(); r != nil {
			err, ok := r.(error)
			if !ok {
				err = fmt.Errorf("%v", r)
			}

			slog.Error("recovered from panic",
				slog.String("error", err.Error()),
				slog.String("path", c.Path()),
				slog.String("request-id", c.Get(fiber.HeaderXRequestID)),
			)

			_ = c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Internal Server Error",
			})
		}
	}()

	return c.Next()
}
