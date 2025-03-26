//nolint:all
package model

import (
	"encoding/json"
	"fmt"
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
)

var LLMNodeType = map[string]bool{
	"chat-openai":    true,
	"chat-anthropic": true,
	"chat-gemini":    true,
	"chat-mistral":   true,
	"chat-ollama":    true,
}

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
		processor, err := p.getNodeProcessor(node.Type)
		if err != nil {
			return nil, fmt.Errorf("unable to get node processor: %w", err)
		}
		if processor == nil {
			// Skip unknown node types
			continue
		}

		if err := processor(nodes, node.ID, node, builderFlow.Edges, nodeMap); err != nil {
			return nil, fmt.Errorf("unable to process node: %w", err)
		}
	}

	return result, nil
}

// getNodeProcessor returns the appropriate processor function for a given node type
func (p *Project) getNodeProcessor(nodeType string) (func(map[string]any, string, BuilderNode, []BuilderEdge, map[string]BuilderNode) error, error) {
	switch {
	case nodeType == "entrypoint":
		return p.processEntrypointNode, nil
	case nodeType == "result":
		return p.processResultNode, nil
	case LLMNodeType[nodeType]:
		return p.processLLMNode, nil
	case nodeType == "code-executor":
		return p.processCodeExecutorNode, nil
	default:
		return nil, ErrInvalidNodeError
	}
}

// Base processor functions
func (p *Project) processEntrypointNode(nodes map[string]any, nodeID string, node BuilderNode, _ []BuilderEdge, _ map[string]BuilderNode) error {
	var data EntrypointNodeData
	if err := json.Unmarshal(node.Data, &data); err != nil {
		return errs.InvalidError{Reason: "unable to unmarshal entrypoint node data", Err: err}
	}

	// create the outputs map based on handles
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

func (p *Project) processResultNode(nodes map[string]any, nodeID string, node BuilderNode, edges []BuilderEdge, _ map[string]BuilderNode) error {
	var data ResultNodeData
	if err := json.Unmarshal(node.Data, &data); err != nil {
		return errs.InvalidError{Reason: "unable to unmarshal result node data", Err: err}
	}

	// create the inputs map based on incoming edges
	inputs := p.buildInputsFromEdges(node.ID, data.Handles, edges)

	nodes[nodeID] = map[string]any{
		"type":   "result",
		"inputs": inputs,
	}

	return nil
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

func (p *Project) processCodeExecutorNode(nodes map[string]any, nodeID string, node BuilderNode, edges []BuilderEdge, nodeMap map[string]BuilderNode) error {
	var data CodeExecutorNodeData
	if err := json.Unmarshal(node.Data, &data); err != nil {
		return errs.InvalidError{Reason: "unable to unmarshal code executor node data", Err: err}
	}

	nodeConfig := map[string]any{
		"type":              "code-executor",
		"code":              data.Code,
		"expectedArguments": data.Inputs,
	}

	// Build inputs from edges
	inputs := p.buildNodeInputs(node.ID, edges)
	nodeConfig["inputs"] = inputs

	// Build outputs and check for result node connection
	outputs := p.buildNodeOutputs(node.ID, edges, nodeMap)
	nodeConfig["outputs"] = outputs

	nodes[nodeID] = nodeConfig

	return nil
}

// processLLMNode processes an LLM node
func (p *Project) processLLMNode(nodes map[string]any, nodeID string, node BuilderNode, edges []BuilderEdge, nodeMap map[string]BuilderNode) error {
	var nodeConfig map[string]any
	if err := json.Unmarshal(node.Data, &nodeConfig); err != nil {
		return fmt.Errorf("unable to unmarshal LLM node data: %w", err)
	}

	credentialID, err := uuid.Parse(nodeConfig["credentialId"].(string))
	if err != nil {
		return fmt.Errorf("invalid credential ID: %w", err)
	}

	apiKey, err := p.getCredentialAPIKey(credentialID)
	if err != nil {
		return fmt.Errorf("unable to get credential API key: %w", err)
	}

	nodeConfig["type"] = node.Type
	nodeConfig["apiKey"] = apiKey
	nodeConfig["streaming"] = nodeConfig["outputMode"].(string) == "text-stream"

	// Build inputs from edges
	inputs := p.buildNodeInputs(node.ID, edges)
	nodeConfig["inputs"] = inputs

	// Build outputs and check for result node connection
	outputs := p.buildNodeOutputs(node.ID, edges, nodeMap)
	nodeConfig["outputs"] = outputs

	nodes[nodeID] = nodeConfig

	return nil
}

// buildInputsFromEdges creates an inputs map for nodes with handle data
func (p *Project) buildInputsFromEdges(nodeID string, handles []NodeHandle, edges []BuilderEdge) map[string]any {
	inputs := make(map[string]any)

	for _, handle := range handles {
		// find edges that connect to this handle of the node
		for _, edge := range edges {
			if edge.Target == nodeID && edge.TargetHandle == handle.ID {
				// this edge connects to this handle
				sourceNode := edge.Source
				sourceHandle := edge.SourceHandle

				// parse the handle format (assuming format like "type__name")
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

	return inputs
}

// buildNodeInputs creates a standard inputs map for a node based on incoming edges
func (p *Project) buildNodeInputs(nodeID string, edges []BuilderEdge) map[string]any {
	inputs := make(map[string]any)

	// find all edges that target this node
	for _, edge := range edges {
		if edge.Target == nodeID {
			// this is an input edge
			sourceNode := edge.Source
			targetHandle := edge.TargetHandle

			// parse the handle format
			handleParts := p.parseHandle(targetHandle)
			if len(handleParts) != 2 {
				continue
			}

			handleType := handleParts[0]
			handleName := handleParts[1]

			// get the source handle parts
			sourceHandleParts := p.parseHandle(edge.SourceHandle)
			if len(sourceHandleParts) != 2 {
				continue
			}
			sourceHandleName := sourceHandleParts[1]

			inputs[handleName] = map[string]string{
				"type":   handleType,
				"source": sourceNode + "." + sourceHandleName,
			}
		}
	}

	return inputs
}

// buildNodeOutputs creates a standard outputs map for a node and checks for result connections
func (p *Project) buildNodeOutputs(nodeID string, edges []BuilderEdge, nodeMap map[string]BuilderNode) map[string]any {
	outputs := make(map[string]any)
	node, exists := nodeMap[nodeID]
	if !exists {
		return outputs
	}

	// Find all outgoing connections from this node
	outEdges := []BuilderEdge{}
	for _, edge := range edges {
		if edge.Source == nodeID {
			outEdges = append(outEdges, edge)
		}
	}

	// Group edges by source handle
	edgesBySourceHandle := make(map[string][]BuilderEdge)
	for _, edge := range outEdges {
		sourceHandle := edge.SourceHandle
		edgesBySourceHandle[sourceHandle] = append(edgesBySourceHandle[sourceHandle], edge)
	}

	// If no outgoing edges, add default response for LLM nodes
	if len(outEdges) == 0 && (node.Type == "chat-openai" || node.Type == "llm") {
		outputs["response"] = map[string]string{
			"type": "text",
		}
		return outputs
	}

	// Process each output handle
	for sourceHandle, handleEdges := range edgesBySourceHandle {
		sourceHandleParts := p.parseHandle(sourceHandle)
		if len(sourceHandleParts) != 2 {
			continue
		}

		sourceType := sourceHandleParts[0]
		sourceName := sourceHandleParts[1]

		// For each handle, check if it's connected to the result node
		resultKey := ""
		for _, edge := range handleEdges {
			if edge.Target == ResultNodeID {
				targetHandle := edge.TargetHandle

				// Find the label in the result node
				if resultNode, exists := nodeMap[ResultNodeID]; exists {
					var resultData ResultNodeData
					if err := json.Unmarshal(resultNode.Data, &resultData); err == nil {
						for _, handle := range resultData.Handles {
							if handle.ID == targetHandle {
								resultKey = handle.Label
								break
							}
						}
					}
				}
				break
			}
		}

		// Create output config
		outputConfig := map[string]string{
			"type": sourceType,
		}
		if resultKey != "" {
			outputConfig["result_key"] = resultKey
		}

		outputs[sourceName] = outputConfig
	}

	// Special case for LLM nodes, use "response" as the output name
	if (node.Type == "chat-openai" || node.Type == "llm") && len(outputs) > 0 {
		// Convert any output to "response" for LLM nodes
		for _, output := range outputs {
			outputConfig, ok := output.(map[string]string)
			if ok {
				outputs = map[string]any{
					"response": outputConfig,
				}
				break
			}
		}
	}

	return outputs
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
