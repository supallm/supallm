//nolint:all
package model

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"strings"

	"github.com/google/uuid"
	"github.com/lithammer/shortuuid"
	"github.com/supallm/core/internal/pkg/errs"
)

type (
	WorkflowID     string
	WorkflowStatus string
)

func NewWorkflowID() WorkflowID {
	return WorkflowID(shortuuid.New())
}

func (s WorkflowStatus) String() string {
	return string(s)
}

func (id WorkflowID) String() string {
	return string(id)
}

const (
	WorkflowStatusDraft     WorkflowStatus = "draft"
	WorkflowStatusPublished WorkflowStatus = "published"
	WorkflowStatusArchived  WorkflowStatus = "archived"

	ResultNodeID = "result-node"
	EntrypointID = "entrypoint-node"

	TextType  = "text"
	ImageType = "image"
	AnyType   = "any"

	LLMNodeType = "llm"
)

type Workflow struct {
	ID          WorkflowID
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
	Source       string `json:"target"`                 // because of the reverse direction of reactflow
	Target       string `json:"source"`                 // because of the reverse direction of reactflow
	SourceHandle string `json:"targetHandle,omitempty"` // because of the reverse direction of reactflow
	TargetHandle string `json:"sourceHandle,omitempty"` // because of the reverse direction of reactflow
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

type CodeExecutorNodeHandle struct {
	ID    string `json:"id"`
	Type  string `json:"type"`
	Label string `json:"label"`
}

type CodeExecutorNodeData struct {
	Code    string                   `json:"code"`
	Inputs  []CodeExecutorNodeHandle `json:"inputs"`
	Outputs []CodeExecutorNodeHandle `json:"outputs"`
}

type RunnerFlow struct {
	Nodes map[string]json.RawMessage `json:"nodes" exhaustruct:"optional"`
}

type RunnerInput struct {
	Source string `json:"source,omitempty"`
	Type   string `json:"type,omitempty"`
}

type RunnerOutput struct {
	Type      string `json:"type,omitempty"`
	ResultKey string `json:"result_key,omitempty"`
}

func (p *Project) CreateWorkflow(id WorkflowID, name string, builderFlow json.RawMessage) (*Workflow, error) {
	w := &Workflow{
		ID:        id,
		ProjectID: p.ID,
		Name:      name,
		Status:    WorkflowStatusDraft,
		BuilderFlow: BuilderFlow{
			Nodes: []BuilderNode{},
			Edges: []BuilderEdge{},
		},
		RunnerFlow: nil,
	}

	if err := w.SetBuilderFlow(builderFlow); err != nil {
		return nil, err
	}

	p.Workflows[id] = w
	return w, nil
}

func (p *Project) UpdateWorkflowName(id WorkflowID, name string) error {
	w, ok := p.Workflows[id]
	if !ok {
		return errs.NotFoundError{Resource: "workflow", ID: id}
	}
	w.Name = name
	p.Workflows[id] = w
	return nil
}

func (p *Project) UpdateWorkflowBuilderFlow(id WorkflowID, builderFlow json.RawMessage) error {
	w, ok := p.Workflows[id]
	if !ok {
		return errs.NotFoundError{Resource: "workflow", ID: id}
	}
	if err := w.SetBuilderFlow(builderFlow); err != nil {
		return err
	}

	w.RunnerFlow = nil
	p.Workflows[id] = w
	return nil
}

func (p *Project) ComputeWorkflow(id WorkflowID) (*Workflow, error) {
	w, ok := p.Workflows[id]
	if !ok {
		return nil, ErrWorkflowNotFound
	}

	if w.RunnerFlow != nil {
		return w, nil
	}

	runnerFlow, err := p.ComputeRunnerFlow(w.BuilderFlow)
	if err != nil {
		return nil, fmt.Errorf("unable to compute runner flow: %w", err)
	}
	w.RunnerFlow = runnerFlow
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

func (p *Project) ComputeRunnerFlow(builderFlow BuilderFlow) (json.RawMessage, error) {
	result, err := p.convertBuilderToRunnerFlow(builderFlow)
	if err != nil {
		return nil, fmt.Errorf("unable to convert builder to runner flow: %w", err)
	}

	runnerFlowJSON, err := json.Marshal(result)
	if err != nil {
		return nil, fmt.Errorf("unable to marshal runner flow: %w", err)
	}

	return runnerFlowJSON, nil
}

func (p *Project) convertBuilderToRunnerFlow(builderFlow BuilderFlow) (map[string]any, error) {
	result := map[string]any{
		"nodes": map[string]any{},
	}
	nodes := result["nodes"].(map[string]any)

	// Create a map of nodeID -> builderNode for easier lookup
	nodeMap := make(map[string]BuilderNode)
	for _, node := range builderFlow.Nodes {
		nodeMap[node.ID] = node
	}

	// First pass: Add all nodes to the result map with their basic info
	for _, node := range builderFlow.Nodes {
		var err error

		// The ID for entrypoint and result nodes in the runner are simplified
		var runnerNodeID string
		if node.ID == EntrypointID {
			runnerNodeID = "entrypoint"
		} else if node.ID == ResultNodeID {
			runnerNodeID = "result"
		} else {
			runnerNodeID = node.ID
		}

		switch node.Type {
		case "entrypoint":
			err = p.processEntrypointNode(nodes, runnerNodeID, node)
		case "result":
			err = p.processResultNode(nodes, runnerNodeID, node, builderFlow.Edges)
		case "chat-openai", "llm":
			err = p.processLLMNode(nodes, runnerNodeID, node, builderFlow.Edges, nodeMap)
		case "code-executor":
			err = p.processCodeExecutorNode(nodes, runnerNodeID, node, builderFlow.Edges, nodeMap)
		default:
			// Skip unknown node types
			continue
		}

		if err != nil {
			return nil, err
		}
	}

	return result, nil
}

// processEntrypointNode processes the entrypoint node
func (p *Project) processEntrypointNode(nodes map[string]any, nodeID string, node BuilderNode) error {
	var data EntrypointNodeData
	if err := json.Unmarshal(node.Data, &data); err != nil {
		return errs.InvalidError{Reason: "unable to unmarshal entrypoint node data", Err: err}
	}

	// Create the outputs map based on handles
	outputs := make(map[string]any)
	for _, handle := range data.Handles {
		outputs[handle.Label] = map[string]string{
			"type": handle.Type,
		}
	}

	nodes[nodeID] = map[string]any{
		"type":    "entrypoint",
		"outputs": outputs,
	}

	return nil
}

// processResultNode processes the result node
func (p *Project) processResultNode(nodes map[string]any, nodeID string, node BuilderNode, edges []BuilderEdge) error {
	var data ResultNodeData
	if err := json.Unmarshal(node.Data, &data); err != nil {
		return errs.InvalidError{Reason: "unable to unmarshal result node data", Err: err}
	}

	// Create the inputs map based on incoming edges
	inputs := make(map[string]any)

	for _, handle := range data.Handles {
		// Find edges that connect to this handle of the result node
		for _, edge := range edges {
			if edge.Target == ResultNodeID && edge.TargetHandle == handle.ID {
				// This edge connects to this handle
				// The source is the node that provides input to the result node
				sourceNode := edge.Source
				sourceHandle := edge.SourceHandle

				// Parse the handle format (assuming format like "type__name")
				handleParts := p.parseHandle(sourceHandle)
				if len(handleParts) != 2 {
					continue
				}

				inputs[handle.Label] = map[string]string{
					"type":   handle.Type,
					"source": sourceNode + "." + handleParts[1],
				}

				break
			}
		}
	}

	nodes[nodeID] = map[string]any{
		"type":   "result",
		"inputs": inputs,
	}

	return nil
}

// processCodeExecutorNode processes a code executor node
func (p *Project) processCodeExecutorNode(nodes map[string]any, nodeID string, node BuilderNode, edges []BuilderEdge, nodeMap map[string]BuilderNode) error {
	slog.Info("processing code executor node", "nodeID", nodeID, "node", node)
	var data CodeExecutorNodeData
	if err := json.Unmarshal(node.Data, &data); err != nil {
		return errs.InvalidError{Reason: "unable to unmarshal code executor node data", Err: err}
	}

	nodeConfig := map[string]any{
		"type":              "code-executor",
		"code":              data.Code,
		"expectedArguments": data.Inputs,
		"expectedOutputs":   data.Outputs,
	}

	// Process inputs
	inputs := make(map[string]any)

	// Find all edges that target this node
	for _, edge := range edges {
		if edge.Target == node.ID {
			// This is an input edge
			sourceNode := edge.Source
			targetHandle := edge.TargetHandle

			// Parse handle format
			handleParts := p.parseHandle(targetHandle)
			if len(handleParts) != 2 {
				continue
			}

			handleType := handleParts[0]
			handleName := handleParts[1]

			// Create the input entry
			sourceNodeID := sourceNode
			if sourceNode == EntrypointID {
				sourceNodeID = "entrypoint"
			}

			// Get source handle parts
			sourceHandleParts := p.parseHandle(edge.SourceHandle)
			if len(sourceHandleParts) != 2 {
				continue
			}
			sourceHandleName := sourceHandleParts[1]

			inputs[handleName] = map[string]string{
				"type":   handleType,
				"source": sourceNodeID + "." + sourceHandleName,
			}
		}
	}

	nodeConfig["inputs"] = inputs

	// Process outputs
	outputs := make(map[string]any)

	// Add a default response output
	responseOutput := map[string]string{
		"type": "text",
	}

	// Check if this node has an edge to the result node
	for _, edge := range edges {
		if edge.Source == node.ID && edge.Target == ResultNodeID {
			// This node has a connection to the result node
			sourceHandle := edge.SourceHandle
			targetHandle := edge.TargetHandle

			// Parse handles
			sourceHandleParts := p.parseHandle(sourceHandle)
			targetHandleParts := p.parseHandle(targetHandle)

			if len(sourceHandleParts) == 2 && len(targetHandleParts) == 2 {
				// Find the result node to get the handle label
				for _, resultNode := range nodeMap {
					if resultNode.ID == ResultNodeID {
						var resultData ResultNodeData
						if err := json.Unmarshal(resultNode.Data, &resultData); err != nil {
							return err
						}

						// Find the matching handle in the result node
						for _, handle := range resultData.Handles {
							if handle.ID == targetHandle {
								// Add the result_key to the output
								responseOutput["result_key"] = handle.Label
								break
							}
						}
						break
					}
				}
			}
			break
		}
	}

	outputs["response"] = responseOutput
	nodeConfig["outputs"] = outputs

	nodes[nodeID] = nodeConfig

	return nil
}

// processLLMNode processes an LLM node
func (p *Project) processLLMNode(nodes map[string]any, nodeID string, node BuilderNode, edges []BuilderEdge, nodeMap map[string]BuilderNode) error {
	var data LLMNodeData
	if err := json.Unmarshal(node.Data, &data); err != nil {
		return fmt.Errorf("unable to unmarshal LLM node data: %w", err)
	}

	credentialID, err := uuid.Parse(data.CredentialID)
	if err != nil {
		return fmt.Errorf("invalid credential ID: %w", err)
	}

	apiKey, err := p.getCredentialAPIKey(credentialID)
	if err != nil {
		return fmt.Errorf("unable to get credential API key: %w", err)
	}

	nodeConfig := map[string]any{
		"type":         "llm",
		"model":        data.Model,
		"apiKey":       apiKey,
		"provider":     data.ProviderType,
		"maxTokens":    data.MaxCompletionTokens,
		"streaming":    data.OutputMode == "text-stream",
		"temperature":  data.Temperature,
		"systemPrompt": data.DeveloperMessage,
	}

	// Process inputs
	inputs := make(map[string]any)

	// Find all edges that target this node
	for _, edge := range edges {
		if edge.Target == node.ID {
			// This is an input edge
			sourceNode := edge.Source
			targetHandle := edge.TargetHandle

			// Parse handle format
			handleParts := p.parseHandle(targetHandle)
			if len(handleParts) != 2 {
				continue
			}

			handleType := handleParts[0]
			handleName := handleParts[1]

			// Create the input entry
			sourceNodeID := sourceNode
			if sourceNode == EntrypointID {
				sourceNodeID = "entrypoint"
			}

			// Get source handle parts
			sourceHandleParts := p.parseHandle(edge.SourceHandle)
			if len(sourceHandleParts) != 2 {
				continue
			}
			sourceHandleName := sourceHandleParts[1]

			inputs[handleName] = map[string]string{
				"type":   handleType,
				"source": sourceNodeID + "." + sourceHandleName,
			}
		}
	}

	nodeConfig["inputs"] = inputs

	// Process outputs
	outputs := make(map[string]any)

	// Add a default response output
	responseOutput := map[string]string{
		"type": "text",
	}

	// Check if this node has an edge to the result node
	for _, edge := range edges {
		if edge.Source == node.ID && edge.Target == ResultNodeID {
			// This node has a connection to the result node
			sourceHandle := edge.SourceHandle
			targetHandle := edge.TargetHandle

			// Parse handles
			sourceHandleParts := p.parseHandle(sourceHandle)
			targetHandleParts := p.parseHandle(targetHandle)

			if len(sourceHandleParts) == 2 && len(targetHandleParts) == 2 {
				// Find the result node to get the handle label
				for _, resultNode := range nodeMap {
					if resultNode.ID == ResultNodeID {
						var resultData ResultNodeData
						if err := json.Unmarshal(resultNode.Data, &resultData); err != nil {
							return err
						}

						// Find the matching handle in the result node
						for _, handle := range resultData.Handles {
							if handle.ID == targetHandle {
								// Add the result_key to the output
								responseOutput["result_key"] = handle.Label
								break
							}
						}
						break
					}
				}
			}
			break
		}
	}

	outputs["response"] = responseOutput
	nodeConfig["outputs"] = outputs

	nodes[nodeID] = nodeConfig

	return nil
}

// Helper function to parse handle format "type__name"
func (p *Project) parseHandle(handle string) []string {
	return strings.Split(handle, "__")
}

func (p *Project) getCredentialAPIKey(credentialID uuid.UUID) (string, error) {
	credential, ok := p.Credentials[credentialID]
	if !ok {
		return "", ErrCredentialNotFound
	}

	return credential.APIKey.String(), nil
}

func (w *Workflow) UpdateStatus(status WorkflowStatus) {
	w.Status = status
}
