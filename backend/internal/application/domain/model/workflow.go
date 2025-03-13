package model

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/google/uuid"
	"github.com/supallm/core/internal/pkg/errs"
)

type WorkflowStatus string

func (s WorkflowStatus) String() string {
	return string(s)
}

const (
	WorkflowStatusDraft     WorkflowStatus = "draft"
	WorkflowStatusPublished WorkflowStatus = "published"
	WorkflowStatusArchived  WorkflowStatus = "archived"
)

type Workflow struct {
	ID          uuid.UUID
	ProjectID   uuid.UUID
	Name        string
	Status      WorkflowStatus
	BuilderFlow BuilderFlow     `exhaustruct:"optional"`
	RunnerFlow  json.RawMessage `exhaustruct:"optional"`
}

type BuilderFlow struct {
	Nodes []BuilderNode `json:"nodes" exhaustruct:"optional"`
	Edges []BuilderEdge `json:"edges" exhaustruct:"optional"`
}

type BuilderNode struct {
	ID        string          `json:"id"`
	Type      string          `json:"type"`
	Position  Position        `json:"position"`
	Data      json.RawMessage `json:"data"`
	ZIndex    int             `json:"zIndex,omitempty"`
	Selected  bool            `json:"selected,omitempty"`
	Dragging  bool            `json:"dragging,omitempty"`
	Deletable *bool           `json:"deletable,omitempty"`
	Measured  *NodeMeasured   `json:"measured,omitempty"`
}

type Position struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type NodeMeasured struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

type BuilderEdge struct {
	ID           string `json:"id"`
	Source       string `json:"source"`
	Target       string `json:"target"`
	SourceHandle string `json:"sourceHandle,omitempty"`
	TargetHandle string `json:"targetHandle,omitempty"`
	Selected     bool   `json:"selected,omitempty"`
}

type NodeHandle struct {
	Type  string `json:"type"`
	ID    string `json:"id"`
	Label string `json:"label,omitempty"`
}

type EntrypointNodeData struct {
	Handles []NodeHandle `json:"handles"`
}

type ResultNodeData struct {
	Handles []NodeHandle `json:"handles"`
}

type LLMNodeData struct {
	CredentialID        string          `json:"credentialId"`
	ProviderType        string          `json:"providerType"`
	Model               string          `json:"model"`
	Temperature         float64         `json:"temperature"`
	MaxCompletionTokens int             `json:"maxCompletionTokens"`
	DeveloperMessage    string          `json:"developerMessage"`
	ImageResolution     string          `json:"imageResolution"`
	ResponseFormat      json.RawMessage `json:"responseFormat"`
	OutputMode          string          `json:"outputMode"`
}

type RunnerFlow struct {
	Nodes map[string]RunnerNode `json:"nodes" exhaustruct:"optional"`
}

type RunnerNode struct {
	Type        string                  `json:"type"`
	Model       string                  `json:"model,omitempty"`
	Provider    string                  `json:"provider,omitempty"`
	Credentials *RunnerCredentials      `json:"credentials,omitempty"`
	Stream      bool                    `json:"stream,omitempty"`
	Inputs      map[string]string       `json:"inputs,omitempty"`
	Outputs     map[string]RunnerOutput `json:"outputs,omitempty"`
}

type RunnerCredentials struct {
	APIKey string `json:"apiKey,omitempty"`
}

type RunnerOutput struct {
	Type        string `json:"type"`
	Description string `json:"description,omitempty"`
}

type RunnerInput struct {
	Type        string `json:"type"`
	Description string `json:"description,omitempty"`
}

func (p *Project) AddWorkflow(id uuid.UUID, name string, builderFlow json.RawMessage) error {
	w := &Workflow{
		ID:        id,
		ProjectID: p.ID,
		Name:      name,
		Status:    WorkflowStatusDraft,
		BuilderFlow: BuilderFlow{
			Nodes: []BuilderNode{},
			Edges: []BuilderEdge{},
		},
		RunnerFlow: json.RawMessage{},
	}

	if err := w.SetBuilderFlow(builderFlow); err != nil {
		return err
	}
	if err := w.ComputeRunnerFlow(builderFlow); err != nil {
		return err
	}

	p.Workflows[id] = w
	return nil
}

func (p *Project) UpdateWorkflowName(id uuid.UUID, name string) error {
	w, ok := p.Workflows[id]
	if !ok {
		return errs.NotFoundError{Resource: "workflow", ID: id}
	}
	w.Name = name
	p.Workflows[id] = w
	return nil
}

func (p *Project) UpdateWorkflowBuilderFlow(id uuid.UUID, builderFlow json.RawMessage) error {
	w, ok := p.Workflows[id]
	if !ok {
		return errs.NotFoundError{Resource: "workflow", ID: id}
	}
	if err := w.SetBuilderFlow(builderFlow); err != nil {
		return err
	}
	if err := w.ComputeRunnerFlow(builderFlow); err != nil {
		return err
	}
	p.Workflows[id] = w
	return nil
}

func (p *Project) GetWorkflow(id uuid.UUID) (*Workflow, error) {
	w, ok := p.Workflows[id]
	if !ok {
		return nil, errs.NotFoundError{Resource: "workflow", ID: id}
	}
	return w, nil
}

func (w *Workflow) SetBuilderFlow(builderFlowJSON json.RawMessage) error {
	var builderFlow BuilderFlow
	if err := json.Unmarshal(builderFlowJSON, &builderFlow); err != nil {
		return errs.InvalidError{Reason: "unable to unmarshal builder flow", Err: err}
	}
	w.BuilderFlow = builderFlow
	return nil
}

func (w *Workflow) ComputeRunnerFlow(builderFlowJSON json.RawMessage) error {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return errs.InvalidError{Reason: "OPENAI_API_KEY is not set"}
	}

	fakeRunnerFlowJSON := fmt.Sprintf(fakeRunnerFlowJSON, apiKey, apiKey)
	w.RunnerFlow = json.RawMessage(fakeRunnerFlowJSON)
	return nil
}

func (w *Workflow) UpdateStatus(status WorkflowStatus) {
	w.Status = status
}

//nolint:lll
const fakeRunnerFlowJSON = `{
		"nodes": {
			"entrypoint": {
				"type": "entrypoint",
				"outputs": {
					"prompt": {
						"type": "string"
					}
				}
			},
			"e4fd228c-08a5-4075-a134-9ea6772ef80a": {
				"type": "llm",
				"provider": "openai",
				"model": "gpt-4o",
				"temperature": 0.5,
				"maxTokens": 4000,
				"systemPrompt": "Lorsqu'on te demande des idées de contenu, utilise le {{format 4A}} et propose des idées originales adaptées et engageantes pour le sujet que tu reçois",
				"streaming": true,
				"apiKey": "%s",
				"inputs": {
					"prompt": {
						"source": "entrypoint.prompt"
					}
				},
				"outputs": {
					"response": {
						"type": "string"
					},
					"responseStream": {
						"type": "stream",
						"outputField": "idea"
					}
				}
			},
			"60c7bd2e-f5e6-4949-b648-591e262d54ea": {
				"type": "llm",
				"provider": "openai",
				"model": "gpt-4o-mini",
				"temperature": 0.5,
				"maxTokens": 1000,
				"systemPrompt": "Génère moi un hook dédié a linkedin pour le sujet que tu reçois",
				"streaming": true,
				"apiKey": "%s",
				"inputs": {
					"prompt": {
						"source": "e4fd228c-08a5-4075-a134-9ea6772ef80a.response"
					}
				},
				"outputs": {
					"response": {
						"type": "string"
					},
					"responseStream": {
						"type": "stream",
						"outputField": "hook"
					}
				}
			},
			"result": {
				"type": "result",
				"inputs": {
					"hook": {
						"type": "stream"
					},
					"idea": {
						"type": "stream"
					}
				}
			}
		}
	}`
