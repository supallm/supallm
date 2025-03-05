package application

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/supallm/core/internal/adapters/llm"
	"github.com/supallm/core/internal/adapters/project"
	"github.com/supallm/core/internal/adapters/session"
	"github.com/supallm/core/internal/application/command"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/pkg/config"
)

type App struct {
	Commands *Commands
	Queries  *Queries
	pool     *pgxpool.Pool
}

type Commands struct {
	CreateProject      command.CreateProjectHandler
	UpdateProjectName  command.UpdateProjectNameHandler
	UpdateAuthProvider command.UpdateAuthProviderHandler

	AddModel    command.AddModelHandler
	UpdateModel command.UpdateModelHandler
	RemoveModel command.RemoveModelHandler

	AddLLMCredential    command.AddLLMCredentialHandler
	UpdateLLMCredential command.UpdateLLMCredentialHandler
	RemoveLLMCredential command.RemoveLLMCredentialHandler

	GenerateText command.GenerateTextHandler
	StreamText   command.StreamTextHandler
}

type Queries struct {
	GetProject      query.GetProjectHandler
	ListProjects    query.ListProjectsHandler
	ListModels      query.ListModelsHandler
	ListCredentials query.ListCredentialsHandler
}

func New(
	ctx context.Context,
	conf config.Config,
) (*App, error) {
	pool, err := pgxpool.New(ctx, conf.Postgres.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to create pgxpool: %w", err)
	}
	err = pool.Ping(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}
	slog.Info("connected to postgres")

	projectRepo := project.NewRepository(ctx, pool)
	sessionRepo := session.NewRepository(ctx, pool)
	llmRegistry := llm.NewProviderRegistry()

	app := &App{
		pool: pool,
		Commands: &Commands{
			CreateProject:      command.NewCreateProjectHandler(projectRepo),
			UpdateProjectName:  command.NewUpdateProjectNameHandler(projectRepo),
			UpdateAuthProvider: command.NewUpdateAuthProviderHandler(projectRepo),

			AddModel:    command.NewAddModelHandler(projectRepo),
			UpdateModel: command.NewUpdateModelHandler(projectRepo),
			RemoveModel: command.NewRemoveModelHandler(projectRepo),

			AddLLMCredential:    command.NewAddLLMCredentialHandler(projectRepo, llmRegistry),
			UpdateLLMCredential: command.NewUpdateLLMCredentialHandler(projectRepo),
			RemoveLLMCredential: command.NewRemoveLLMCredentialHandler(projectRepo),

			GenerateText: command.NewGenerateTextHandler(projectRepo, sessionRepo, llmRegistry),
			StreamText:   command.NewStreamTextHandler(projectRepo, sessionRepo, llmRegistry),
		},
		Queries: &Queries{
			GetProject:      query.NewGetProjectHandler(projectRepo),
			ListProjects:    query.NewListProjectsHandler(projectRepo),
			ListModels:      query.NewListModelsHandler(projectRepo),
			ListCredentials: query.NewListCredentialsHandler(projectRepo),
		},
	}

	return app, nil
}

// Shutdown gracefully closes all application resources
func (a *App) Shutdown(ctx context.Context) error {
	slog.Info("shutting down application resources")

	// Close database connection pool
	if a.pool != nil {
		slog.Info("closing database connection pool")
		a.pool.Close()
	}

	return nil
}
