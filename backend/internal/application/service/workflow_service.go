package service

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/application/domain/model"
)

type WorkflowRepository interface {
	Create(ctx context.Context, wf *model.Workflow) error
	Get(ctx context.Context, id uuid.UUID) (*model.Workflow, error)
	Update(ctx context.Context, wf *model.Workflow) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListByProject(ctx context.Context, projectID uuid.UUID) ([]*model.Workflow, error)
}

type ProjectRepository interface {
	Retrieve(ctx context.Context, projectID uuid.UUID) (*model.Project, error)
}

type WorkflowService struct {
	workflowRepo      WorkflowRepository
	projectRepo       ProjectRepository
	workflowValidator *model.WorkflowValidator
}

func NewWorkflowService(workflowRepo WorkflowRepository, projectRepo ProjectRepository) (*WorkflowService, error) {
	validator, err := model.NewWorkflowValidator()
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la création du validateur de workflow: %w", err)
	}

	return &WorkflowService{
		workflowRepo:      workflowRepo,
		projectRepo:       projectRepo,
		workflowValidator: validator,
	}, nil
}

func (s *WorkflowService) CreateWorkflow(ctx context.Context, projectID uuid.UUID, name, description string, definition model.Definition) (*model.Workflow, error) {
	// Récupérer le projet pour valider les credentials
	project, err := s.projectRepo.Retrieve(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération du projet: %w", err)
	}

	// Créer le workflow
	wf := &model.Workflow{
		ID:          uuid.New(),
		ProjectID:   projectID,
		Name:        name,
		Description: description,
		Status:      model.WorkflowStatusDraft,
		Definition:  definition,
	}

	// Valider le workflow avec le schéma JSON
	definitionJSON, err := json.Marshal(wf.Definition)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la sérialisation de la définition: %w", err)
	}

	valid, errors, err := s.workflowValidator.ValidateWorkflowJSON(string(definitionJSON))
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la validation du workflow: %w", err)
	}

	if !valid {
		return nil, fmt.Errorf("workflow invalide: %v", errors)
	}

	// Valider les références aux credentials
	if err := project.Validate(wf); err != nil {
		return nil, fmt.Errorf("workflow invalide: %w", err)
	}

	// Calculer la définition optimisée
	if err := wf.ComputeDefinition(project); err != nil {
		return nil, fmt.Errorf("erreur lors du calcul de la définition: %w", err)
	}

	// Sauvegarder le workflow
	if err := s.workflowRepo.Create(ctx, wf); err != nil {
		return nil, fmt.Errorf("erreur lors de la création du workflow: %w", err)
	}

	return wf, nil
}

func (s *WorkflowService) GetWorkflow(ctx context.Context, id uuid.UUID) (*model.Workflow, error) {
	return s.workflowRepo.Get(ctx, id)
}

func (s *WorkflowService) UpdateWorkflow(ctx context.Context, id uuid.UUID, name, description string, definition model.Definition, status model.WorkflowStatus) (*model.Workflow, error) {
	wf, err := s.workflowRepo.Get(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération du workflow: %w", err)
	}

	project, err := s.projectRepo.Retrieve(ctx, wf.ProjectID)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération du projet: %w", err)
	}

	wf.Name = name
	wf.Description = description
	wf.Definition = definition
	wf.Status = status

	if err := project.Validate(wf); err != nil {
		return nil, fmt.Errorf("workflow invalide: %w", err)
	}

	if err := wf.ComputeDefinition(); err != nil {
		return nil, fmt.Errorf("erreur lors du calcul de la définition: %w", err)
	}

	if err := s.workflowRepo.Update(ctx, wf); err != nil {
		return nil, fmt.Errorf("erreur lors de la mise à jour du workflow: %w", err)
	}

	return wf, nil
}

func (s *WorkflowService) DeleteWorkflow(ctx context.Context, id uuid.UUID) error {
	return s.workflowRepo.Delete(ctx, id)
}

func (s *WorkflowService) ListWorkflows(ctx context.Context, projectID uuid.UUID) ([]*model.Workflow, error) {
	return s.workflowRepo.ListByProject(ctx, projectID)
}
