package http

import (
	"context"
	"log/slog"
	"os"

	"github.com/ThreeDotsLabs/watermill"
	watermillHTTP "github.com/ThreeDotsLabs/watermill-http/v2/pkg/http"
	"github.com/google/uuid"
	"github.com/supallm/core/internal/application"
	"github.com/supallm/core/internal/application/command"
	"github.com/supallm/core/internal/application/event"
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

	logger := watermill.NewSlogLogger(nil)
	sseRouter, err := watermillHTTP.NewSSERouter(
		watermillHTTP.SSERouterConfig{
			UpstreamSubscriber: s.app.EventsSubscriber,
			ErrorHandler:       watermillHTTP.DefaultErrorHandler,
			Marshaler:          workflowSSEMarshaller{},
		},
		logger,
	)
	if err != nil {
		slog.Error("error creating sse router", "error", err)
		os.Exit(1)
	}

	sseHandler := sseRouter.AddHandler(event.InternalEventsTopic, workflowSSEAdapter{})
	s.server.Router.Get(
		"/projects/{projectId}/workflows/{workflowId}/listen/{triggerId}",
		s.listenWorkflowEvents(sseHandler),
	)

	go func() {
		err = sseRouter.Run(context.Background())
		slog.Debug("running sse router")
		if err != nil {
			slog.Error("error running sse router", "error", err)
			os.Exit(1)
		}
	}()

	<-sseRouter.Running()
	slog.Debug("sse router is ready")

	h := gen.HandlerWithOptions(s, gen.ChiServerOptions{
		BaseURL: "",
		Middlewares: []gen.MiddlewareFunc{
			gen.MiddlewareFunc(s.server.JWTAuthMiddleware),
		},
	})
	mux.Router.Mount("/", h)
}

func (s *Server) isAuthorize(
	ctx context.Context,
	projectID uuid.UUID,
	fn func(ctx context.Context, cmd command.AuthorizeEventSubscriptionCommand) error,
) error {
	if s.server.IsDashboardOrigin(ctx) {
		return nil
	}

	secretKey, err := s.server.GetSecretKeyFromContext(ctx)
	if err != nil {
		return err
	}

	return fn(ctx, command.AuthorizeEventSubscriptionCommand{
		ProjectID: projectID,
		SecretKey: secretKey,
	})
}
