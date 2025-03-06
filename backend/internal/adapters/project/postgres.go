package project

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/query"
)

type Repository struct {
	queries *Queries
	pool    *pgxpool.Pool
}

func NewRepository(_ context.Context, pool *pgxpool.Pool) *Repository {
	return &Repository{
		queries: New(pool),
		pool:    pool,
	}
}

func (r Repository) withTx(ctx context.Context, fn func(*Queries) error) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("error starting transaction: %w", err)
	}

	isCommitted := false
	defer func() {
		if !isCommitted {
			if err = tx.Rollback(ctx); err != nil {
				slog.Error("error rolling back transaction", "error", err)
			}
		}
	}()

	q := New(tx)
	if err = fn(q); err != nil {
		return err
	}

	if err = tx.Commit(ctx); err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}
	isCommitted = true

	return nil
}

func (r Repository) Create(ctx context.Context, project *model.Project) error {
	return r.withTx(ctx, func(q *Queries) error {
		err := q.storeProject(ctx, storeProjectParams{
			ID:     project.ID,
			UserID: project.UserID,
			Name:   project.Name,
		})
		if err != nil {
			return fmt.Errorf("error storing project: %w", err)
		}

		return nil
	})
}

func (r Repository) retrieveDependencies(ctx context.Context, projectID uuid.UUID) ([]Credential, []Model, error) {
	llmCredentials, err := r.queries.credentialsByProjectId(ctx, projectID)
	if err != nil {
		return nil, nil, fmt.Errorf("error getting llm credentials: %w", err)
	}

	models, err := r.queries.modelsByProjectId(ctx, projectID)
	if err != nil {
		return nil, nil, fmt.Errorf("error getting models: %w", err)
	}

	return llmCredentials, models, nil
}

func (r Repository) retrieve(ctx context.Context, projectID uuid.UUID) (Project, []Credential, []Model, error) {
	project, err := r.queries.projectById(ctx, projectID)
	if err != nil {
		return Project{}, nil, nil, fmt.Errorf("error getting project: %w", err)
	}

	llmCredentials, models, err := r.retrieveDependencies(ctx, projectID)
	if err != nil {
		return Project{}, nil, nil, fmt.Errorf("error getting dependencies: %w", err)
	}

	return project, llmCredentials, models, nil
}

func (r Repository) Retrieve(ctx context.Context, projectID uuid.UUID) (*model.Project, error) {
	project, llmProviders, models, err := r.retrieve(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("error getting project: %w", err)
	}

	return project.domain(llmProviders, models)
}

func (r Repository) Update(ctx context.Context, project *model.Project) error {
	return r.withTx(ctx, func(q *Queries) error {
		if err := r.updateProjectDetails(ctx, q, project); err != nil {
			return err
		}

		if project.Credentials != nil {
			if err := r.updateCredentials(ctx, q, project); err != nil {
				return err
			}
		}

		if project.Models != nil {
			if err := r.updateModels(ctx, q, project); err != nil {
				return err
			}
		}

		return nil
	})
}

func (r Repository) updateProjectDetails(ctx context.Context, q *Queries, project *model.Project) error {
	var ap authProvider
	if project.AuthProvider != nil {
		ap = authProvider{
			Type:   project.AuthProvider.GetType().String(),
			Config: project.AuthProvider.Config(),
		}
	}

	err := q.updateProject(ctx, updateProjectParams{
		ID:           project.ID,
		Name:         project.Name,
		AuthProvider: ap,
	})
	if err != nil {
		return fmt.Errorf("error updating project: %w", err)
	}
	return nil
}

func (r Repository) updateCredentials(ctx context.Context, q *Queries, project *model.Project) error {
	for id, llmCredential := range project.Credentials {
		if llmCredential == nil {
			continue
		}

		encrypted, err := llmCredential.APIKey.Encrypt()
		if err != nil {
			return fmt.Errorf("error encrypting api key: %w", err)
		}

		err = q.upsertCredential(ctx, upsertCredentialParams{
			ID:               id,
			ProjectID:        project.ID,
			Name:             llmCredential.Name,
			ProviderType:     llmCredential.ProviderType.String(),
			ApiKeyEncrypted:  encrypted,
			ApiKeyObfuscated: llmCredential.APIKey.Obfuscate(),
		})
		if err != nil {
			return fmt.Errorf("error updating llm provider: %w", err)
		}
	}
	return nil
}

func (r Repository) updateModels(ctx context.Context, q *Queries, project *model.Project) error {
	for slug, model := range project.Models {
		if model == nil {
			continue
		}

		if model.Credential == nil {
			return fmt.Errorf("model %s has nil credential", slug)
		}

		err := q.upsertModel(ctx, upsertModelParams{
			ID:            model.ID,
			ProjectID:     project.ID,
			CredentialID:  model.Credential.ID,
			Name:          model.Name,
			Slug:          slug.String(),
			ProviderModel: model.ProviderModel.String(),
			SystemPrompt:  model.SystemPrompt.String(),
			Parameters: modelParameters{
				MaxTokens:   model.Parameters.MaxTokens,
				Temperature: model.Parameters.Temperature,
			},
		})
		if err != nil {
			return fmt.Errorf("error updating model: %w", err)
		}
	}
	return nil
}

func (r Repository) DeleteProject(ctx context.Context, id uuid.UUID) error {
	err := r.queries.deleteProject(ctx, id)
	if err != nil {
		return fmt.Errorf("error deleting project: %w", err)
	}
	return nil
}

func (r Repository) DeleteLLMCredential(ctx context.Context, id uuid.UUID) error {
	err := r.queries.deleteCredential(ctx, id)
	if err != nil {
		return fmt.Errorf("error deleting llm credential: %w", err)
	}
	return nil
}

func (r Repository) DeleteModel(ctx context.Context, id uuid.UUID) error {
	err := r.queries.deleteModel(ctx, id)
	if err != nil {
		return fmt.Errorf("error deleting model: %w", err)
	}
	return nil
}

func (r Repository) GetProject(ctx context.Context, id uuid.UUID) (query.Project, error) {
	project, llmProviders, models, err := r.retrieve(ctx, id)
	if err != nil {
		return query.Project{}, fmt.Errorf("error getting project: %w", err)
	}

	return project.query(llmProviders, models), nil
}

func (r Repository) ListProjects(ctx context.Context, userID string) ([]query.Project, error) {
	projects, err := r.queries.projectsByUserId(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("error getting projects: %w", err)
	}

	queryProjects := make([]query.Project, len(projects))
	for i, project := range projects {
		var llmProviders []Credential
		var models []Model

		llmProviders, models, err = r.retrieveDependencies(ctx, project.ID)
		if err != nil {
			return nil, fmt.Errorf("error getting project: %w", err)
		}
		queryProjects[i] = project.query(llmProviders, models)
	}

	return queryProjects, nil
}
