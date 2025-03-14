package project

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/query"
)

func (r Repository) AddWorkflow(ctx context.Context, projectID uuid.UUID, workflow *model.Workflow) error {
	builderFlow, err := json.Marshal(workflow.BuilderFlow)
	if err != nil {
		return fmt.Errorf("unable to marshal builder flow: %w", err)
	}

	err = r.queries.storeWorkflow(ctx, storeWorkflowParams{
		ID:          workflow.ID.String(),
		ProjectID:   projectID,
		Name:        workflow.Name,
		Status:      workflow.Status.String(),
		BuilderFlow: builderFlow,
		RunnerFlow:  workflow.RunnerFlow,
	})
	if err != nil {
		return r.errorDecoder(err)
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

		err = q.upsertWorkflow(ctx, upsertWorkflowParams{
			ID:          workflow.ID.String(),
			ProjectID:   project.ID,
			Name:        workflow.Name,
			Status:      workflow.Status.String(),
			BuilderFlow: builderFlow,
			RunnerFlow:  workflow.RunnerFlow,
		})
		if err != nil {
			return r.errorDecoder(err)
		}
	}
	return nil
}

func (r Repository) DeleteWorkflow(ctx context.Context, id model.WorkflowID) error {
	err := r.queries.deleteWorkflow(ctx, id.String())
	if err != nil {
		return r.errorDecoder(err)
	}
	return nil
}

func (r Repository) ReadWorkflow(
	ctx context.Context,
	projectID uuid.UUID,
	workflowID model.WorkflowID,
) (query.Workflow, error) {
	workflow, err := r.queries.workflowById(ctx, workflowID.String())
	if err != nil {
		return query.Workflow{}, err
	}
	return *workflow.query(), nil
}
