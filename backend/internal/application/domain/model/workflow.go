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
		RunnerFlow: json.RawMessage{},
	}

	if err := w.SetBuilderFlow(builderFlow); err != nil {
		return nil, err
	}
	runnerFlow, err := p.ComputeRunnerFlow(builderFlow)
	if err != nil {
		return nil, err
	}
	w.RunnerFlow = runnerFlow
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
	runnerFlow, err := p.ComputeRunnerFlow(builderFlow)
	if err != nil {
		return err
	}
	w.RunnerFlow = runnerFlow
	p.Workflows[id] = w
	return nil
}

func (p *Project) GetWorkflow(id WorkflowID) (*Workflow, error) {
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

func (p *Project) ComputeRunnerFlow(builderFlowJSON json.RawMessage) (json.RawMessage, error) {
	var builderFlow BuilderFlow
	if err := json.Unmarshal(builderFlowJSON, &builderFlow); err != nil {
		return nil, errs.InvalidError{Reason: "unable to unmarshal builder flow", Err: err}
	}

	result, err := p.convertBuilderToRunnerFlow(builderFlow)
	if err != nil {
		return nil, err
	}

	runnerFlowJSON, err := json.Marshal(result)
	if err != nil {
		return nil, errs.InternalError{Err: err}
	}

	return runnerFlowJSON, nil
}

func (p *Project) convertBuilderToRunnerFlow(builderFlow BuilderFlow) (map[string]any, error) {
	result := make(map[string]any)
	nodes := make(map[string]any)
	result["nodes"] = nodes

	// Créer une carte pour stocker les connexions entrantes
	incomingConnections := make(map[string][]struct {
		SourceID     string
		SourceHandle string
		TargetHandle string
	})

	// Créer une carte pour stocker les connexions sortantes
	outgoingConnections := make(map[string][]struct {
		TargetID     string
		SourceHandle string
		TargetHandle string
	})

	// Analyser toutes les connexions
	for _, edge := range builderFlow.Edges {
		// Connexions entrantes
		incomingConnections[edge.Target] = append(incomingConnections[edge.Target], struct {
			SourceID     string
			SourceHandle string
			TargetHandle string
		}{
			SourceID:     edge.Source,
			SourceHandle: edge.SourceHandle,
			TargetHandle: edge.TargetHandle,
		})

		// Connexions sortantes
		outgoingConnections[edge.Source] = append(outgoingConnections[edge.Source], struct {
			TargetID     string
			SourceHandle string
			TargetHandle string
		}{
			TargetID:     edge.Target,
			SourceHandle: edge.SourceHandle,
			TargetHandle: edge.TargetHandle,
		})
	}

	// Construire une carte des nœuds par ID pour un accès facile
	nodesMap := make(map[string]BuilderNode)
	for _, node := range builderFlow.Nodes {
		nodesMap[node.ID] = node
	}

	// Traiter d'abord le nœud entrypoint et result pour établir les inputs/outputs
	for _, node := range builderFlow.Nodes {
		if node.ID == EntrypointID || node.ID == ResultNodeID {
			nodeConfig := make(map[string]any)
			nodeConfig["type"] = node.Type

			var err error
			switch node.ID {
			case EntrypointID:
				err = processEntrypointNode(node, nodeConfig)
			case ResultNodeID:
				err = processResultNode(node, nodeConfig, incomingConnections)
			default:
				return nil, errs.InvalidError{Reason: "invalid node id", Err: fmt.Errorf("invalid node id: %s", node.ID)}
			}
			if err != nil {
				return nil, err
			}

			nodes[node.ID] = nodeConfig
		}
	}

	// Traiter ensuite les autres nœuds
	for _, node := range builderFlow.Nodes {
		if node.ID != EntrypointID && node.ID != ResultNodeID {
			nodeConfig := make(map[string]any)

			var err error
			switch {
			case node.Type == "llm" || node.Type == "chat-openai":
				nodeConfig["type"] = "llm"
				err = p.processLLMNode(node, nodeConfig, incomingConnections, outgoingConnections)
			default:
				return nil, errs.InvalidError{Reason: "invalid node type", Err: fmt.Errorf("invalid node type: %s", node.Type)}
			}
			if err != nil {
				return nil, err
			}

			nodes[node.ID] = nodeConfig
		}
	}

	return result, nil
}

func processEntrypointNode(node BuilderNode, nodeConfig map[string]any) error {
	var data EntrypointNodeData
	if err := json.Unmarshal(node.Data, &data); err != nil {
		return errs.InvalidError{Reason: "unable to unmarshal entrypoint node data", Err: err}
	}

	outputs := make(map[string]map[string]any)
	for _, handle := range data.Handles {
		var outputType string
		switch handle.Type {
		case TextType:
			outputType = "text"
		case ImageType:
			outputType = "image"
		case AnyType:
			outputType = "any"
		default:
			return errs.InvalidError{Reason: "invalid handle type", Err: fmt.Errorf("invalid handle type: %s", handle.Type)}
		}

		outputs[handle.Label] = map[string]any{
			"type": outputType,
		}
	}

	nodeConfig["outputs"] = outputs
	return nil
}

func processResultNode(node BuilderNode, nodeConfig map[string]any, incomingConnections map[string][]struct {
	SourceID     string
	SourceHandle string
	TargetHandle string
}) error {
	var data ResultNodeData
	if err := json.Unmarshal(node.Data, &data); err != nil {
		return errs.InvalidError{Reason: "unable to unmarshal result node data", Err: err}
	}

	inputs := make(map[string]map[string]any)

	// Créer une map des handles par ID pour les retrouver facilement
	handleMap := make(map[string]string)
	for _, handle := range data.Handles {
		handleMap[handle.ID] = handle.Label
	}

	// Chercher les connexions pour chaque input du result-node
	for _, conn := range incomingConnections[ResultNodeID] {
		targetHandleID := conn.TargetHandle
		sourceOutputName := getOutputName(conn.SourceHandle)
		inputName := getOutputName(targetHandleID)

		if label, exists := handleMap[targetHandleID]; exists {
			inputName = label
		}

		// Créer l'entrée pour ce input
		inputs[inputName] = map[string]any{
			"type":   getHandleType(conn.TargetHandle),
			"source": conn.SourceID + "." + sourceOutputName,
		}
	}

	if len(inputs) > 0 {
		nodeConfig["inputs"] = inputs
	}

	return nil
}

// processLLMNode traite un nœud de type chat-openai (LLM)
func (p *Project) processLLMNode(
	node BuilderNode,
	nodeConfig map[string]any,
	incomingConnections map[string][]struct {
		SourceID     string
		SourceHandle string
		TargetHandle string
	},
	outgoingConnections map[string][]struct {
		TargetID     string
		SourceHandle string
		TargetHandle string
	},
) error {
	var data LLMNodeData
	if err := json.Unmarshal(node.Data, &data); err != nil {
		return errs.InvalidError{Reason: "unable to unmarshal LLM node data", Err: err}
	}

	// Définir les propriétés du nœud
	nodeConfig["model"] = data.Model
	nodeConfig["provider"] = data.ProviderType
	nodeConfig["temperature"] = data.Temperature
	nodeConfig["streaming"] = data.OutputMode == "text-stream"

	// Max tokens
	if data.MaxCompletionTokens > 0 {
		nodeConfig["maxTokens"] = data.MaxCompletionTokens
	} else {
		// Valeur par défaut selon le modèle
		if data.Model == "gpt-4o" {
			nodeConfig["maxTokens"] = 4000
		} else {
			nodeConfig["maxTokens"] = 1000
		}
	}

	// System prompt
	if data.DeveloperMessage != "" {
		nodeConfig["systemPrompt"] = data.DeveloperMessage
	}

	// Obtenir la clé API
	if data.CredentialID != "" {
		credentialID, err := uuid.Parse(data.CredentialID)
		if err != nil {
			return errs.InvalidError{Reason: "invalid credential ID", Err: err}
		}

		apiKey, err := p.getCredentialAPIKey(credentialID)
		if err != nil {
			return err
		}
		nodeConfig["apiKey"] = apiKey
	}

	// Traiter les inputs
	inputs := make(map[string]map[string]any)

	// Par défaut pour un modèle LLM, ajouter l'input prompt
	inputName := "prompt"

	// Si des connexions entrantes existent, les utiliser
	if conns, ok := incomingConnections[node.ID]; ok && len(conns) > 0 {
		for _, conn := range conns {
			sourceOutput := getOutputName(conn.SourceHandle)
			targetHandle := getInputName(conn.TargetHandle)

			inputs[targetHandle] = map[string]any{
				"source": conn.SourceID + "." + sourceOutput,
			}
		}
	} else {
		inputs[inputName] = map[string]any{}
	}

	nodeConfig["inputs"] = inputs
	// Traiter les outputs
	outputs := make(map[string]map[string]any)

	// Par défaut, ajouter l'output "response"

	outputs["response"] = map[string]any{
		"type": "text",
	}

	resultKey, ok := getResultKey(node.ID, outgoingConnections)
	if ok {
		outputs["response"] = map[string]any{
			"type":       "text",
			"result_key": resultKey,
		}
	}

	nodeConfig["outputs"] = outputs
	return nil
}

func (p *Project) getCredentialAPIKey(credentialID uuid.UUID) (string, error) {
	credential, ok := p.Credentials[credentialID]
	if !ok {
		return "", errs.NotFoundError{Resource: "credential", ID: credentialID}
	}

	apiKey, err := credential.APIKey.Decrypt()
	if err != nil {
		return "", errs.InternalError{Err: err}
	}

	return apiKey.String(), nil
}

func getResultKey(nodeID string, outgoingConnections map[string][]struct {
	TargetID     string
	SourceHandle string
	TargetHandle string
}) (string, bool) {
	for _, conn := range outgoingConnections[ResultNodeID] {
		if conn.TargetID == nodeID {
			sourceHandleParts := strings.Split(conn.SourceHandle, "__")
			if len(sourceHandleParts) > 1 {
				return sourceHandleParts[1], true
			}
		}
	}

	return "", false
}

func getInputName(handle string) string {
	parts := strings.Split(handle, "__")
	if len(parts) > 1 {
		return parts[1]
	}
	return handle
}

func getOutputName(handle string) string {
	parts := strings.Split(handle, "__")
	if len(parts) > 1 {
		return parts[1]
	}
	return handle
}

func getHandleType(handle string) string {
	parts := strings.Split(handle, "__")
	if len(parts) > 1 {
		return parts[0]
	}
	return handle
}

func (w *Workflow) UpdateStatus(status WorkflowStatus) {
	w.Status = status
}
