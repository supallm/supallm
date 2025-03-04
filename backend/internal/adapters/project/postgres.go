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

func (s *Repository) withTx(ctx context.Context, fn func(*Queries) error) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("error starting transaction: %w", err)
	}
	defer func() {
		if err := tx.Rollback(ctx); err != nil {
			slog.Error("error rolling back transaction", "error", err)
		}
	}()

	q := New(tx)
	if err := fn(q); err != nil {
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	return nil
}

func (r Repository) Create(ctx context.Context, project *model.Project) error {
	return r.withTx(ctx, func(q *Queries) error {
		err := q.storeProject(ctx, storeProjectParams{
			ID:     project.ID,
			UserID: project.UserID,
			Name:   project.Name,
			AuthProvider: authProvider{
				Type:   project.AuthProvider.GetType().String(),
				Config: project.AuthProvider.Config(),
			},
		})
		if err != nil {
			return fmt.Errorf("error storing project: %w", err)
		}

		for _, llmProvider := range project.LLMProviders {
			encrypted, err := llmProvider.APIKey.Encrypt()
			if err != nil {
				return fmt.Errorf("error encrypting api key: %w", err)
			}
			err = q.storeLLMProvider(ctx, storeLLMProviderParams{
				ID:               llmProvider.ID,
				ProjectID:        project.ID,
				Name:             llmProvider.Name,
				ProviderType:     llmProvider.Type.String(),
				ApiKeyEncrypted:  encrypted,
				ApiKeyObfuscated: llmProvider.APIKey.Obfuscate(),
			})
			if err != nil {
				return fmt.Errorf("error storing llm provider: %w", err)
			}
		}

		for _, model := range project.Models {
			err = q.storeModel(ctx, storeModelParams{
				ID:           model.ID,
				ProjectID:    project.ID,
				ProviderID:   model.ProviderId,
				Slug:         model.Slug.String(),
				LlmModel:     model.Model.String(),
				SystemPrompt: model.SystemPrompt.String(),
			})
			if err != nil {
				return fmt.Errorf("error storing model: %w", err)
			}
		}

		return nil
	})
}

func (r Repository) retrieve(ctx context.Context, id uuid.UUID) (Project, []LlmProvider, []Model, error) {
	project, err := r.queries.projectById(ctx, id)
	if err != nil {
		return Project{}, nil, nil, fmt.Errorf("error getting project: %w", err)
	}

	llmProviders, err := r.queries.llmProvidersByProjectId(ctx, id)
	if err != nil {
		return Project{}, nil, nil, fmt.Errorf("error getting llm providers: %w", err)
	}

	models, err := r.queries.modelsByProjectId(ctx, id)
	if err != nil {
		return Project{}, nil, nil, fmt.Errorf("error getting models: %w", err)
	}

	return project, llmProviders, models, nil
}

func (r Repository) Retrieve(ctx context.Context, id uuid.UUID) (*model.Project, error) {
	project, llmProviders, models, err := r.retrieve(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("error getting project: %w", err)
	}

	return project.domain(llmProviders, models)
}

func (r Repository) Update(ctx context.Context, project *model.Project) error {
	return r.withTx(ctx, func(q *Queries) error {
		err := q.updateProject(ctx, updateProjectParams{
			ID:   project.ID,
			Name: project.Name,
			AuthProvider: authProvider{
				Type:   project.AuthProvider.GetType().String(),
				Config: project.AuthProvider.Config(),
			},
		})
		if err != nil {
			return fmt.Errorf("error updating project: %w", err)
		}

		for _, llmProvider := range project.LLMProviders {
			encrypted, err := llmProvider.APIKey.Encrypt()
			if err != nil {
				return fmt.Errorf("error encrypting api key: %w", err)
			}
			err = q.upsertLLMProvider(ctx, upsertLLMProviderParams{
				ID:               llmProvider.ID,
				ProjectID:        project.ID,
				Name:             llmProvider.Name,
				ProviderType:     llmProvider.Type.String(),
				ApiKeyEncrypted:  encrypted,
				ApiKeyObfuscated: llmProvider.APIKey.Obfuscate(),
			})
			if err != nil {
				return fmt.Errorf("error updating llm provider: %w", err)
			}
		}

		for _, model := range project.Models {
			err = q.upsertModel(ctx, upsertModelParams{
				ID:           model.ID,
				ProjectID:    project.ID,
				ProviderID:   model.ProviderId,
				Slug:         model.Slug.String(),
				LlmModel:     model.Model.String(),
				SystemPrompt: model.SystemPrompt.String(),
			})
			if err != nil {
				return fmt.Errorf("error updating model: %w", err)
			}
		}

		return nil
	})
}

func (r Repository) DeleteProject(ctx context.Context, id uuid.UUID) error {
	err := r.queries.deleteProject(ctx, id)
	if err != nil {
		return fmt.Errorf("error deleting project: %w", err)
	}
	return nil
}

func (r Repository) DeleteLLMProvider(ctx context.Context, id uuid.UUID) error {
	err := r.queries.deleteLLMProvider(ctx, id)
	if err != nil {
		return fmt.Errorf("error deleting llm provider: %w", err)
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

	return project.query(llmProviders, models)
}

func (r Repository) ListProjects(ctx context.Context, userID uuid.UUID) ([]query.Project, error) {
	// projects, err := r.queries.projectsByUserId(ctx, userID)
	// if err != nil {
	// 	return nil, fmt.Errorf("error getting projects: %w", err)
	// }

	// queryProjects := make([]query.Project, len(projects))
	// for i, project := range projects {
	// 	queryProjects[i], err = project.query(llmProviders, models)
	// 	if err != nil {
	// 		return nil, fmt.Errorf("error getting project: %w", err)
	// 	}
	// }

	return nil, nil
}
