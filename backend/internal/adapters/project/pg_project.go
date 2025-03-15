package project

import (
	"context"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/query"
)

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

		for _, apiKey := range project.APIKeys {
			err = q.storeAPIKey(ctx, storeAPIKeyParams{
				ID:        apiKey.ID,
				ProjectID: project.ID,
				KeyHash:   apiKey.KeyHash,
			})
			if err != nil {
				return r.errorDecoder(err)
			}
		}

		return nil
	})
}

func (r Repository) Retrieve(ctx context.Context, projectID uuid.UUID) (*model.Project, error) {
	project, llmProviders, workflows, apiKeys, err := r.retrieve(ctx, projectID)
	if err != nil {
		return nil, err
	}

	domainProject, err := project.domain(llmProviders, workflows, apiKeys)
	if err != nil {
		return nil, err
	}

	return domainProject, nil
}

func (r Repository) Update(ctx context.Context, project *model.Project) error {
	return r.withTx(ctx, func(q *Queries) error {
		currentProject, err := q.projectById(ctx, project.ID)
		if err != nil {
			return r.errorDecoder(err)
		}

		if err = r.updateProjectDetails(ctx, q, project, currentProject.Version); err != nil {
			return err
		}

		if project.Credentials != nil {
			if err = r.updateCredentials(ctx, q, project); err != nil {
				return err
			}
		}

		if project.Workflows != nil {
			if err = r.updateWorkflows(ctx, q, project); err != nil {
				return err
			}
		}

		if project.APIKeys != nil {
			if err = r.updateAPIKeys(ctx, q, project); err != nil {
				return err
			}
		}

		return nil
	})
}

func (r Repository) updateProjectDetails(
	ctx context.Context,
	q *Queries,
	project *model.Project,
	currentVersion int64,
) error {
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
		Version:      currentVersion,
	})
	if err != nil {
		return r.errorDecoder(err)
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

func (r Repository) ReadProject(ctx context.Context, id uuid.UUID) (query.Project, error) {
	project, llmProviders, models, apiKeys, err := r.retrieve(ctx, id)
	if err != nil {
		return query.Project{}, err
	}

	return project.query(llmProviders, models, apiKeys)
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
		var apiKeys []ApiKey

		llmProviders, workflows, apiKeys, err = r.retrieveDependencies(ctx, project.ID)
		if err != nil {
			return nil, err
		}
		queryProjects[i], err = project.query(llmProviders, workflows, apiKeys)
		if err != nil {
			return nil, err
		}
	}

	return queryProjects, nil
}
