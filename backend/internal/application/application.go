package application

import (
	"context"
	"log/slog"
	"time"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/supallm/core/internal/adapters/events"
	"github.com/supallm/core/internal/adapters/execution"
	"github.com/supallm/core/internal/adapters/project"
	"github.com/supallm/core/internal/adapters/runner"
	"github.com/supallm/core/internal/adapters/user"
	"github.com/supallm/core/internal/application/command"
	"github.com/supallm/core/internal/application/event"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/pkg/config"
	"github.com/supallm/core/internal/pkg/postgres"
	"github.com/supallm/core/internal/pkg/redis"
)

const (
	eventTTL = time.Minute * 5
)

type App struct {
	Commands *Commands
	Queries  *Queries

	EventsSubscriber message.Subscriber
	pool             *pgxpool.Pool
}

type Commands struct {
	CreateProject      command.CreateProjectHandler
	UpdateProjectName  command.UpdateProjectNameHandler
	UpdateAuthProvider command.UpdateAuthProviderHandler

	AddWorkflow    command.AddWorkflowHandler
	UpdateWorkflow command.UpdateWorkflowHandler
	RemoveWorkflow command.RemoveWorkflowHandler

	AddCredential    command.AddCredentialHandler
	UpdateCredential command.UpdateCredentialHandler
	RemoveCredential command.RemoveCredentialHandler

	TriggerWorkflow            command.TriggerWorkflowHandler
	AuthorizeEventSubscription command.AuthorizeEventSubscriptionHandler
	CreateJWT                  command.CreateJWTHandler

	loadFixture command.LoadFixtureHandler
}

type Queries struct {
	GetProject   query.GetProjectHandler
	ListProjects query.ListProjectsHandler

	ListWorkflows query.ListWorkflowsHandler
	GetWorkflow   query.GetWorkflowHandler

	ListCredentials query.ListCredentialsHandler
	GetCredential   query.GetCredentialHandler

	ListenWorkflowEvents query.ListenWorkflowEventsHandler
	GetUser              query.GetUserHandler

	GetWorkflowExecutions query.GetWorkflowExecutionsHandler
	GetTriggerExecution   query.GetTriggerExecutionHandler
}

func New(
	ctx context.Context,
	conf config.Config,
) (*App, error) {
	logger := watermill.NewStdLogger(false, false)
	pool := postgres.NewClient(ctx, conf.Postgres)
	redisWorkflows, err := redis.NewClient(conf.Redis, redis.DBWorkflows)
	if err != nil {
		return nil, err
	}
	redisExecutions, err := redis.NewClient(conf.Redis, redis.DBExecutions)
	if err != nil {
		return nil, err
	}
	redisEvents, err := redis.NewClient(conf.Redis, redis.DBEvents)
	if err != nil {
		return nil, err
	}

	eventRepo := events.NewRedisEventStore(redisEvents, eventTTL)
	router := event.CreateRouter(event.Config{
		WorkflowsRedis: redisWorkflows,
		Logger:         logger,
		EventStore:     eventRepo,
	})

	projectRepo := project.NewRepository(ctx, pool)
	userRepo := user.NewRepository(ctx, pool)
	runnerService := runner.NewService(ctx, router.RunnerPublisher)
	executionRepo := execution.NewRedisExecutionRepository(redisExecutions)

	app := &App{
		pool:             pool,
		EventsSubscriber: router.InternalSubscriber,
		Commands: &Commands{
			CreateProject:      command.NewCreateProjectHandler(projectRepo),
			UpdateProjectName:  command.NewUpdateProjectNameHandler(projectRepo),
			UpdateAuthProvider: command.NewUpdateAuthProviderHandler(projectRepo),

			AddWorkflow:    command.NewAddWorkflowHandler(projectRepo),
			UpdateWorkflow: command.NewUpdateWorkflowHandler(projectRepo),
			RemoveWorkflow: command.NewRemoveWorkflowHandler(projectRepo),

			AddCredential:    command.NewAddCredentialHandler(projectRepo),
			UpdateCredential: command.NewUpdateCredentialHandler(projectRepo),
			RemoveCredential: command.NewRemoveCredentialHandler(projectRepo),

			TriggerWorkflow:            command.NewTriggerWorkflowHandler(projectRepo, runnerService),
			AuthorizeEventSubscription: command.NewAuthorizeEventSubscriptionHandler(projectRepo),
			CreateJWT:                  command.NewCreateJWTHandler(userRepo, conf.Auth.SecretKey),

			loadFixture: command.NewLoadFixtureHandler(projectRepo, userRepo, conf.Auth),
		},
		Queries: &Queries{
			GetProject:   query.NewGetProjectHandler(projectRepo),
			ListProjects: query.NewListProjectsHandler(projectRepo),

			ListCredentials: query.NewListCredentialsHandler(projectRepo),
			GetCredential:   query.NewGetCredentialHandler(projectRepo),

			ListWorkflows: query.NewListWorkflowsHandler(projectRepo),
			GetWorkflow:   query.NewGetWorkflowHandler(projectRepo),

			ListenWorkflowEvents: query.NewListenWorkflowEventsHandler(eventRepo),
			GetUser:              query.NewGetUserHandler(userRepo),

			GetWorkflowExecutions: query.NewGetWorkflowExecutionsHandler(executionRepo),
			GetTriggerExecution:   query.NewGetTriggerExecutionHandler(executionRepo),
		},
	}

	err = app.Commands.loadFixture.Handle(ctx, command.LoadFixtureCommand{})
	if err != nil {
		return nil, err
	}

	go router.Run()
	return app, nil
}

// Shutdown gracefully closes all application resources.
func (a *App) Shutdown(ctx context.Context) error {
	slog.Info("shutting down application resources")

	// Close database connection pool
	if a.pool != nil {
		slog.Info("closing database connection pool")
		a.pool.Close()
	}

	// Close Redis connection pools
	redis.CloseAll()

	return nil
}
