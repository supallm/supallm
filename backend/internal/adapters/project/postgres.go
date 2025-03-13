package project

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	adapterrors "github.com/supallm/core/internal/adapters/errors"
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
		return r.errorDecoder(err)
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
		return r.errorDecoder(err)
	}
	isCommitted = true

	return nil
}

func (r Repository) errorDecoder(err error) error {
	if err == nil {
		return nil
	}

	if errors.Is(err, pgx.ErrNoRows) {
		return fmt.Errorf("%w: %v", adapterrors.ErrNotFound, err.Error())
	}

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case "23505", "23514":
			return fmt.Errorf("%w: %v", adapterrors.ErrDuplicate, err.Error())
		case "23503", "23502", "22P02", "42P01", "42703":
			return fmt.Errorf("%w: %v", adapterrors.ErrInvalid, err.Error())
		}
	}

	return err
}

func (r Repository) Create(ctx context.Context, project *model.Project) error {
	return r.withTx(ctx, func(q *Queries) error {
		err := q.storeProject(ctx, storeProjectParams{
			ID:     project.ID,
			UserID: project.UserID,
			Name:   project.Name,
		})
		if err != nil {
			return r.errorDecoder(err)
		}

		return nil
	})
}

func (r Repository) retrieveDependencies(ctx context.Context, projectID uuid.UUID) ([]Credential, []Workflow, error) {
	llmCredentials, err := r.queries.credentialsByProjectId(ctx, projectID)
	if err != nil {
		slog.Error("error retrieving llm credentials", "error", err)
		return nil, nil, r.errorDecoder(err)
	}

	workflows, err := r.queries.workflowsByProjectId(ctx, projectID)
	if err != nil {
		slog.Error("error retrieving workflows", "error", err)
		return nil, nil, r.errorDecoder(err)
	}

	return llmCredentials, workflows, nil
}

func (r Repository) retrieve(ctx context.Context, projectID uuid.UUID) (Project, []Credential, []Workflow, error) {
	project, err := r.queries.projectById(ctx, projectID)
	if err != nil {
		slog.Error("error retrieving project", "error", err)
		return Project{}, nil, nil, r.errorDecoder(err)
	}

	llmCredentials, workflows, err := r.retrieveDependencies(ctx, projectID)
	if err != nil {
		slog.Error("error retrieving dependencies", "error", err)
		return Project{}, nil, nil, r.errorDecoder(err)
	}

	return project, llmCredentials, workflows, nil
}

func (r Repository) Retrieve(ctx context.Context, projectID uuid.UUID) (*model.Project, error) {
	project, llmProviders, workflows, err := r.retrieve(ctx, projectID)
	if err != nil {
		return nil, err
	}

	return project.domain(llmProviders, workflows)
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

		if project.Workflows != nil {
			if err := r.updateWorkflows(ctx, q, project); err != nil {
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
		return r.errorDecoder(err)
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
			return fmt.Errorf("unable to encrypt api key: %w", err)
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
			return r.errorDecoder(err)
		}
	}
	return nil
}

func (r Repository) updateWorkflows(ctx context.Context, q *Queries, project *model.Project) error {
	for _, workflow := range project.Workflows {
		if workflow == nil {
			continue
		}

		builderFlow, err := json.Marshal(workflow.BuilderFlow)
		if err != nil {
			return fmt.Errorf("unable to marshal builder flow: %w", err)
		}

		// runnerFlow, err := json.Marshal(workflow.RunnerFlow)
		// if err != nil {
		// 	return r.errorDecoder(err)
		// }

		err = q.upsertWorkflow(ctx, upsertWorkflowParams{
			ID:          workflow.ID,
			ProjectID:   project.ID,
			Name:        workflow.Name,
			Status:      workflow.Status.String(),
			BuilderFlow: builderFlow,
			RunnerFlow:  nil,
		})
		if err != nil {
			return r.errorDecoder(err)
		}
	}
	return nil
}

func (r Repository) DeleteProject(ctx context.Context, id uuid.UUID) error {
	err := r.queries.deleteProject(ctx, id)
	if err != nil {
		return r.errorDecoder(err)
	}
	return nil
}

func (r Repository) DeleteCredential(ctx context.Context, id uuid.UUID) error {
	err := r.queries.deleteCredential(ctx, id)
	if err != nil {
		return r.errorDecoder(err)
	}
	return nil
}

func (r Repository) DeleteWorkflow(ctx context.Context, id uuid.UUID) error {
	err := r.queries.deleteWorkflow(ctx, id)
	if err != nil {
		return r.errorDecoder(err)
	}
	return nil
}

func (r Repository) ReadProject(ctx context.Context, id uuid.UUID) (query.Project, error) {
	project, llmProviders, models, err := r.retrieve(ctx, id)
	if err != nil {
		return query.Project{}, err
	}

	return project.query(llmProviders, models), nil
}

func (r Repository) ReadCredential(
	ctx context.Context,
	projectID uuid.UUID,
	credentialID uuid.UUID,
) (query.Credential, error) {
	credential, err := r.queries.credentialById(ctx, credentialID)
	if err != nil {
		return query.Credential{}, r.errorDecoder(err)
	}
	return credential.query(), nil
}

func (r Repository) ReadWorkflow(
	ctx context.Context,
	projectID uuid.UUID,
	workflowID uuid.UUID,
) (query.Workflow, error) {
	workflow, err := r.queries.workflowById(ctx, workflowID)
	if err != nil {
		return query.Workflow{}, err
	}
	return *workflow.query(), nil
}

func (r Repository) ListProjects(ctx context.Context, userID string) ([]query.Project, error) {
	projects, err := r.queries.projectsByUserId(ctx, userID)
	if err != nil {
		return nil, r.errorDecoder(err)
	}

	queryProjects := make([]query.Project, len(projects))
	for i, project := range projects {
		var llmProviders []Credential
		var workflows []Workflow

		llmProviders, workflows, err = r.retrieveDependencies(ctx, project.ID)
		if err != nil {
			return nil, err
		}
		queryProjects[i] = project.query(llmProviders, workflows)
	}

	return queryProjects, nil
}
