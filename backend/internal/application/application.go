package application

import (
	"context"
	"fmt"

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
}

type Commands struct {
	CreateProject      command.CreateProjectHandler
	UpdateProjectName  command.UpdateProjectNameHandler
	UpdateAuthProvider command.UpdateAuthProviderHandler

	AddModel    command.AddModelHandler
	UpdateModel command.UpdateModelHandler
	RemoveModel command.RemoveModelHandler

	AddLLMProvider    command.AddLLMProviderHandler
	UpdateLLMProvider command.UpdateLLMProviderHandler
	RemoveLLMProvider command.RemoveLLMProviderHandler

	GenerateText command.GenerateTextHandler
	StreamText   command.StreamTextHandler
}

type Queries struct {
	GetProject    query.GetProjectHandler
	ListProjects  query.ListProjectsHandler
	ListModels    query.ListModelsHandler
	ListProviders query.ListProvidersHandler
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

	projectRepo := project.NewRepository(ctx, pool)
	sessionRepo := session.NewRepository(ctx, pool)
	llmRegistry := llm.NewProviderRegistry()

	app := &App{
		Commands: &Commands{
			CreateProject:      command.NewCreateProjectHandler(projectRepo),
			UpdateProjectName:  command.NewUpdateProjectNameHandler(projectRepo),
			UpdateAuthProvider: command.NewUpdateAuthProviderHandler(projectRepo),

			AddModel:    command.NewAddModelHandler(projectRepo),
			UpdateModel: command.NewUpdateModelHandler(projectRepo),
			RemoveModel: command.NewRemoveModelHandler(projectRepo),

			AddLLMProvider:    command.NewAddLLMProviderHandler(projectRepo),
			UpdateLLMProvider: command.NewUpdateLLMProviderHandler(projectRepo),
			RemoveLLMProvider: command.NewRemoveLLMProviderHandler(projectRepo),

			GenerateText: command.NewGenerateTextHandler(projectRepo, sessionRepo, llmRegistry),
		},
		Queries: &Queries{
			GetProject:    query.NewGetProjectHandler(projectRepo),
			ListProjects:  query.NewListProjectsHandler(projectRepo),
			ListModels:    query.NewListModelsHandler(projectRepo),
			ListProviders: query.NewListProvidersHandler(projectRepo),
		},
	}

	return app, nil
}
