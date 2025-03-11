package application

import (
	"context"
	"log/slog"
	"os"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-redisstream/pkg/redisstream"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/supallm/core/internal/adapters/project"
	"github.com/supallm/core/internal/adapters/runner"
	"github.com/supallm/core/internal/application/command"
	"github.com/supallm/core/internal/application/event"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/pkg/config"
	"github.com/supallm/core/internal/pkg/postgres"
	"github.com/supallm/core/internal/pkg/redis"
)

type App struct {
	Commands *Commands
	Queries  *Queries

	Subscriber message.Subscriber
	pool       *pgxpool.Pool
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

	TriggerWorkflow command.TriggerWorkflowHandler
}

type Queries struct {
	GetProject   query.GetProjectHandler
	ListProjects query.ListProjectsHandler

	ListWorkflows query.ListWorkflowsHandler
	GetWorkflow   query.GetWorkflowHandler

	ListCredentials query.ListCredentialsHandler
	GetCredential   query.GetCredentialHandler

	ListenWorkflow query.ListenWorkflowHandler
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

	router := event.CreateRouter(event.Config{
		WorkflowsRedis: redisWorkflows,
		Logger:         logger,
	})

	publisher, err := redisstream.NewPublisher(
		redisstream.PublisherConfig{
			Client:     redisWorkflows,
			Marshaller: redisstream.DefaultMarshallerUnmarshaller{},
		},
		logger,
	)
	if err != nil {
		slog.Error("error creating redis stream publisher", "error", err)
		os.Exit(1)
	}

	projectRepo := project.NewRepository(ctx, pool)
	runnerService := runner.NewService(ctx, publisher)

	app := &App{
		pool:       pool,
		Subscriber: router.Subscriber,
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

			TriggerWorkflow: command.NewTriggerWorkflowHandler(projectRepo, runnerService),
		},
		Queries: &Queries{
			GetProject:   query.NewGetProjectHandler(projectRepo),
			ListProjects: query.NewListProjectsHandler(projectRepo),

			ListCredentials: query.NewListCredentialsHandler(projectRepo),
			GetCredential:   query.NewGetCredentialHandler(projectRepo),

			ListWorkflows: query.NewListWorkflowsHandler(projectRepo),
			GetWorkflow:   query.NewGetWorkflowHandler(projectRepo),

			ListenWorkflow: query.NewListenWorkflowHandler(projectRepo),
		},
	}

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
