package command

import (
	"context"
	"log/slog"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/errs"
)

type TriggerWorkflowCommand struct {
	WorkflowID model.WorkflowID
	ProjectID  uuid.UUID
	TriggerID  uuid.UUID
	Inputs     map[string]any
}

type TriggerWorkflowHandler struct {
	projectRepo   repository.ProjectRepository
	runnerService runnerService
}

func NewTriggerWorkflowHandler(
	projectRepo repository.ProjectRepository,
	runnerService runnerService,
) TriggerWorkflowHandler {
	if projectRepo == nil {
		slog.Error("projectRepo is nil")
		os.Exit(1)
	}

	if runnerService == nil {
		slog.Error("runnerService is nil")
		os.Exit(1)
	}

	return TriggerWorkflowHandler{
		projectRepo:   projectRepo,
		runnerService: runnerService,
	}
}

func (h TriggerWorkflowHandler) Handle(ctx context.Context, cmd TriggerWorkflowCommand) error {
	project, err := h.projectRepo.Retrieve(ctx, cmd.ProjectID)
	if err != nil {
		return errs.NotFoundError{Resource: "project", ID: cmd.ProjectID}
	}

	workflow, err := project.ComputeWorkflow(cmd.WorkflowID)
	if err != nil {
		return errs.NotFoundError{Resource: "workflow", ID: cmd.WorkflowID}
	}

	err = h.runnerService.QueueWorkflow(ctx, cmd.TriggerID, workflow, cmd.Inputs)
	if err != nil {
		return errs.InvalidError{Reason: err.Error()}
	}

	go func() {
		// cache the computed workflow
		// error is ignored because it's not critical
		_ = h.projectRepo.Update(context.Background(), project)
	}()
	return nil
}
