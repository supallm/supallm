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

	MemoryPrefix = "memory__"
	ToolsPrefix  = "tools__"
	AITypePrefix = "ai-model__"
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

// RunnerNode represents a node in the runner flow with all required and optional fields
type RunnerNode struct {
	Type    string                  `json:"type"`
	Config  map[string]any          `json:"config,omitempty"`
	Tools   []RunnerTool            `json:"tools,omitempty"`
	Memory  *RunnerMemory           `json:"memory,omitempty"`
	Inputs  map[string]RunnerInput  `json:"inputs,omitempty"`
	Outputs map[string]RunnerOutput `json:"outputs,omitempty"`
}

// RunnerTool represents a tool in the runner flow
type RunnerTool struct {
	Type        string         `json:"type"`
	Name        string         `json:"name,omitempty"`
	Description string         `json:"description,omitempty"`
	Config      map[string]any `json:"config,omitempty"`
}

// RunnerMemory represents memory configuration in the runner flow
type RunnerMemory struct {
	Type   string         `json:"type"`
	Config map[string]any `json:"config,omitempty"`
}

// RunnerInput represents an input connection in the runner flow
type RunnerInput struct {
	Type   string `json:"type"`
	Source string `json:"source"`
}

// RunnerOutput represents an output connection in the runner flow
type RunnerOutput struct {
	Type      string `json:"type"`
	ResultKey string `json:"result_key,omitempty"`
}

// RunnerFlow represents the complete runner flow
type RunnerFlow struct {
	Nodes map[string]RunnerNode `json:"nodes"`
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

func (p *Project) convertBuilderToRunnerFlow(builderFlow BuilderFlow) (*RunnerFlow, error) {
	result := &RunnerFlow{
		Nodes: make(map[string]RunnerNode),
	}

	// Create a map of nodeID -> builderNode for easier lookup
	nodeMap := make(map[string]BuilderNode)
	for _, node := range builderFlow.Nodes {
		nodeMap[node.ID] = node
	}

	slog.Info("builderFlow", "edges", builderFlow.Edges)
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

		slog.Info("node", "id", node.ID, "type", node.Type)
		// Get connected tools and memory for the node
		tools := p.getConnectedTools(node.ID, builderFlow.Edges, nodeMap)
		memory := p.getConnectedMemory(node.ID, builderFlow.Edges, nodeMap)

		// Process the node with its tools and memory
		runnerNode, err := processor(node, builderFlow.Edges, nodeMap, tools, memory)
		if err != nil {
			return nil, fmt.Errorf("unable to process node: %w", err)
		}

		result.Nodes[node.ID] = *runnerNode
	}

	return result, nil
}

// getConnectedTools returns all tools connected to a node
func (p *Project) getConnectedTools(nodeID string, edges []BuilderEdge, nodeMap map[string]BuilderNode) []RunnerTool {
	var tools []RunnerTool

	for _, edge := range edges {
		if edge.Source == nodeID && strings.HasPrefix(edge.SourceHandle, ToolsPrefix) {
			if targetNode, exists := nodeMap[edge.Target]; exists {
				var toolConfig map[string]any
				if err := json.Unmarshal(targetNode.Data, &toolConfig); err == nil {
					tool := RunnerTool{
						Type:   targetNode.Type,
						Config: toolConfig,
					}

					// Add optional name and description if they exist
					if name, ok := toolConfig["name"].(string); ok {
						tool.Name = name
					}
					if desc, ok := toolConfig["description"].(string); ok {
						tool.Description = desc
					}

					tools = append(tools, tool)
				}
			}
		}
	}

	return tools
}

// getConnectedMemory returns the memory configuration connected to a node
func (p *Project) getConnectedMemory(nodeID string, edges []BuilderEdge, nodeMap map[string]BuilderNode) *RunnerMemory {
	for _, edge := range edges {
		if edge.Source == nodeID {
			slog.Info("memory edge", "source", edge.Source, "sourceHandle", edge.SourceHandle, "target", edge.Target)
		}

		if edge.Source == nodeID && strings.HasPrefix(edge.SourceHandle, MemoryPrefix) {
			if memoryNode, exists := nodeMap[edge.Target]; exists {
				var memoryConfig map[string]any
				if err := json.Unmarshal(memoryNode.Data, &memoryConfig); err == nil {
					return &RunnerMemory{
						Type:   memoryNode.Type,
						Config: memoryConfig,
					}
				}
			}
		}
	}
	return nil
}

// getNodeProcessor returns the appropriate processor function for a given node type
func (p *Project) getNodeProcessor(nodeType string) (func(BuilderNode, []BuilderEdge, map[string]BuilderNode, []RunnerTool, *RunnerMemory) (*RunnerNode, error), error) {
	switch {
	case nodeType == "entrypoint":
		return p.processEntrypointNode, nil
	case nodeType == "result":
		return p.processResultNode, nil
	case nodeType == "ai-agent":
		return p.processAIAgentNode, nil
	case LLMNodeType[nodeType]:
		return p.processLLMNode, nil
	case nodeType == "code-executor":
		return p.processCodeExecutorNode, nil
	default:
		slog.Info("unknown node type", "type", nodeType)
		return nil, nil
	}
}

// Base processor functions
func (p *Project) processEntrypointNode(node BuilderNode, edges []BuilderEdge, nodeMap map[string]BuilderNode, tools []RunnerTool, memory *RunnerMemory) (*RunnerNode, error) {
	var data EntrypointNodeData
	if err := json.Unmarshal(node.Data, &data); err != nil {
		return nil, errs.InvalidError{Reason: "unable to unmarshal entrypoint node data", Err: err}
	}

	// create the outputs map based on handles
	outputs := make(map[string]RunnerOutput)
	for _, handle := range data.Handles {
		outputs[handle.Label] = RunnerOutput{
			Type: handle.Type,
		}
	}

	return &RunnerNode{
		Type:    "entrypoint",
		Outputs: outputs,
		Tools:   tools,
		Memory:  memory,
	}, nil
}

func (p *Project) processResultNode(node BuilderNode, edges []BuilderEdge, nodeMap map[string]BuilderNode, tools []RunnerTool, memory *RunnerMemory) (*RunnerNode, error) {
	var data ResultNodeData
	if err := json.Unmarshal(node.Data, &data); err != nil {
		return nil, errs.InvalidError{Reason: "unable to unmarshal result node data", Err: err}
	}

	// create the inputs map based on incoming edges
	inputs := p.buildResultInputs(node.ID, data.Handles, edges)

	return &RunnerNode{
		Type:   "result",
		Inputs: inputs,
		Tools:  tools,
		Memory: memory,
	}, nil
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

func (p *Project) processCodeExecutorNode(node BuilderNode, edges []BuilderEdge, nodeMap map[string]BuilderNode, tools []RunnerTool, memory *RunnerMemory) (*RunnerNode, error) {
	var data CodeExecutorNodeData
	if err := json.Unmarshal(node.Data, &data); err != nil {
		return nil, errs.InvalidError{Reason: "unable to unmarshal code executor node data", Err: err}
	}

	config := map[string]any{
		"code":              data.Code,
		"expectedArguments": data.Inputs,
	}

	// Build inputs and outputs
	inputs := p.buildNodeInputs(node.ID, edges)
	outputs := p.buildNodeOutputs(node.ID, edges, nodeMap)

	return &RunnerNode{
		Type:    "code-executor",
		Config:  config,
		Tools:   tools,
		Memory:  memory,
		Inputs:  inputs,
		Outputs: outputs,
	}, nil
}

// processLLMNode processes an LLM node
func (p *Project) processLLMNode(node BuilderNode, edges []BuilderEdge, nodeMap map[string]BuilderNode, tools []RunnerTool, memory *RunnerMemory) (*RunnerNode, error) {
	var nodeConfig map[string]any
	if err := json.Unmarshal(node.Data, &nodeConfig); err != nil {
		return nil, fmt.Errorf("unable to unmarshal LLM node data: %w", err)
	}

	credId := nodeConfig["credentialId"]
	if credId != nil {
		credentialID, err := uuid.Parse(credId.(string))
		if err != nil {
			return nil, fmt.Errorf("invalid credential ID: %w", err)
		}

		apiKey, err := p.getCredentialAPIKey(credentialID)
		if err != nil {
			return nil, fmt.Errorf("unable to get credential API key: %w", err)
		}

		nodeConfig["apiKey"] = apiKey
	}

	// Build inputs and outputs
	inputs := p.buildNodeInputs(node.ID, edges)
	outputs := p.buildNodeOutputs(node.ID, edges, nodeMap)

	return &RunnerNode{
		Type:    node.Type,
		Config:  nodeConfig,
		Tools:   tools,
		Memory:  memory,
		Inputs:  inputs,
		Outputs: outputs,
	}, nil
}

// processAIAgentNode processes an AI agent node
func (p *Project) processAIAgentNode(node BuilderNode, edges []BuilderEdge, nodeMap map[string]BuilderNode, tools []RunnerTool, memory *RunnerMemory) (*RunnerNode, error) {
	var nodeConfig map[string]any
	if err := json.Unmarshal(node.Data, &nodeConfig); err != nil {
		return nil, fmt.Errorf("unable to unmarshal AI agent node data: %w", err)
	}

	// Build inputs and outputs
	inputs := p.buildNodeInputs(node.ID, edges)
	outputs := p.buildNodeOutputs(node.ID, edges, nodeMap)

	return &RunnerNode{
		Type:    node.Type,
		Config:  nodeConfig,
		Tools:   tools,
		Memory:  memory,
		Inputs:  inputs,
		Outputs: outputs,
	}, nil
}

// buildResultInputs creates an inputs map for nodes with handle data
func (p *Project) buildResultInputs(nodeID string, handles []NodeHandle, edges []BuilderEdge) map[string]RunnerInput {
	inputs := make(map[string]RunnerInput)

	for _, handle := range handles {
		// find edges that connect to this handle of the node
		for _, edge := range edges {
			if edge.Source == nodeID && edge.SourceHandle == handle.ID {
				// this edge connects to this handle
				targetNode := edge.Target
				targetHandle := edge.TargetHandle

				// parse the handle format (assuming format like "type__name")
				handleParts := p.parseHandle(targetHandle)
				if len(handleParts) != 2 {
					continue
				}

				inputs[handle.Label] = RunnerInput{
					Type:   handle.Type,
					Source: targetNode + "." + handleParts[1],
				}
				break
			}
		}
	}

	return inputs
}

// buildNodeInputs creates a standard inputs map for a node based on incoming edges
func (p *Project) buildNodeInputs(nodeID string, edges []BuilderEdge) map[string]RunnerInput {
	inputs := make(map[string]RunnerInput)

	// find all edges that target this node
	for _, edge := range edges {
		if strings.HasPrefix(edge.TargetHandle, MemoryPrefix) ||
			strings.HasPrefix(edge.TargetHandle, ToolsPrefix) ||
			strings.HasPrefix(edge.TargetHandle, AITypePrefix) {
			continue
		}
		if edge.Source == nodeID {
			// this is an input edge
			targetNode := edge.Target
			sourceHandle := edge.SourceHandle

			// parse the handle format
			handleParts := p.parseHandle(sourceHandle)
			if len(handleParts) != 2 {
				continue
			}

			handleType := handleParts[0]
			handleName := handleParts[1]

			// get the source handle parts
			targetHandleParts := p.parseHandle(edge.TargetHandle)
			if len(targetHandleParts) != 2 {
				continue
			}
			targetHandleName := targetHandleParts[1]

			inputs[handleName] = RunnerInput{
				Type:   handleType,
				Source: targetNode + "." + targetHandleName,
			}
		}
	}

	return inputs
}

// buildNodeOutputs creates a standard outputs map for a node and checks for result connections
func (p *Project) buildNodeOutputs(nodeID string, edges []BuilderEdge, nodeMap map[string]BuilderNode) map[string]RunnerOutput {
	outputs := make(map[string]RunnerOutput)
	node, exists := nodeMap[nodeID]
	if !exists {
		return outputs
	}

	// Find all outgoing connections from this node
	outEdges := []BuilderEdge{}
	for _, edge := range edges {
		if edge.Target == nodeID {
			outEdges = append(outEdges, edge)
		}
	}

	// Group edges by source handle
	edgesByTargetHandle := make(map[string][]BuilderEdge)
	for _, edge := range outEdges {
		targetHandle := edge.TargetHandle
		edgesByTargetHandle[targetHandle] = append(edgesByTargetHandle[targetHandle], edge)
	}

	// If no outgoing edges, add default response for LLM nodes
	if len(outEdges) == 0 && (node.Type == "chat-openai" || node.Type == "llm") {
		outputs["response"] = RunnerOutput{
			Type: "text",
		}
		return outputs
	}

	// Process each output handle
	for targetHandle, handleEdges := range edgesByTargetHandle {
		targetHandleParts := p.parseHandle(targetHandle)
		if len(targetHandleParts) != 2 {
			continue
		}

		targetType := targetHandleParts[0]
		targetName := targetHandleParts[1]

		// For each handle, check if it's connected to the result node
		resultKey := ""
		for _, edge := range handleEdges {
			if edge.Source == ResultNodeID {
				sourceHandle := edge.SourceHandle

				// Find the label in the result node
				if resultNode, exists := nodeMap[ResultNodeID]; exists {
					var resultData ResultNodeData
					if err := json.Unmarshal(resultNode.Data, &resultData); err == nil {
						for _, handle := range resultData.Handles {
							if handle.ID == sourceHandle {
								resultKey = handle.Label
								break
							}
						}
					}
				}
				break
			}
		}

		output := RunnerOutput{
			Type: targetType,
		}
		if resultKey != "" {
			output.ResultKey = resultKey
		}

		outputs[targetName] = output
	}

	// Special case for LLM nodes, use "response" as the output name
	if (node.Type == "chat-openai" || node.Type == "llm") && len(outputs) > 0 {
		// Convert any output to "response" for LLM nodes
		for _, output := range outputs {
			outputs = map[string]RunnerOutput{
				"response": output,
			}
			break
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
