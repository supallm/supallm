package model

import (
	"embed"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/xeipuuv/gojsonschema"
)

//go:embed schemas/workflow_schema.json
var schemaFS embed.FS

type WorkflowStatus string

const (
	WorkflowStatusDraft     WorkflowStatus = "draft"
	WorkflowStatusPublished WorkflowStatus = "published"
	WorkflowStatusArchived  WorkflowStatus = "archived"
)

type Workflow struct {
	ID          uuid.UUID      `json:"id"`
	ProjectID   uuid.UUID      `json:"project_id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Status      WorkflowStatus `json:"status"`
	Definition  Definition     `json:"definition"`
	ComputedDef ComputedDef    `json:"computed_def"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

type Definition struct {
	Nodes    []Node   `json:"nodes"`
	Edges    []Edge   `json:"edges"`
	Viewport Viewport `json:"viewport"`
}

type Node struct {
	ID       string          `json:"id"`
	Type     string          `json:"type"`
	Position Position        `json:"position"`
	Data     json.RawMessage `json:"data"`
}

type Edge struct {
	ID           string `json:"id"`
	Source       string `json:"source"`
	Target       string `json:"target"`
	SourceHandle string `json:"sourceHandle,omitempty"`
	TargetHandle string `json:"targetHandle,omitempty"`
	Type         string `json:"type,omitempty"`
}

type Position struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type Viewport struct {
	X    float64 `json:"x"`
	Y    float64 `json:"y"`
	Zoom float64 `json:"zoom"`
}

// ComputedDef represents the optimized definition for LangChain
type ComputedDef struct {
	// Base structure for LangChain
	Chain         map[string]any   `json:"chain"`
	Nodes         map[string]any   `json:"nodes"`
	Connections   []map[string]any `json:"connections"`
	Metadata      map[string]any   `json:"metadata"`
	Configuration map[string]any   `json:"configuration"`
}

// ComputeDefinition transforms the ReactFlow definition into an optimized definition for LangChain
func (w *Workflow) ComputeDefinition(project *Project) error {
	// Initialize the structure for LangChain
	computed := ComputedDef{
		Chain: map[string]any{
			"id":   w.ID.String(),
			"name": w.Name,
			"type": "sequential", // ou "graph" selon votre besoin
		},
		Nodes:         make(map[string]any),
		Connections:   make([]map[string]any, 0),
		Metadata:      make(map[string]any),
		Configuration: make(map[string]any),
	}

	// Créer une map pour un accès rapide aux nœuds
	nodeMap := make(map[string]Node)
	for _, node := range w.Definition.Nodes {
		nodeMap[node.ID] = node
	}

	// Transformer les nœuds ReactFlow en nœuds LangChain
	for _, node := range w.Definition.Nodes {
		var nodeData map[string]any
		if err := json.Unmarshal(node.Data, &nodeData); err != nil {
			return fmt.Errorf("données de nœud invalides: %w", err)
		}

		// Créer un nœud LangChain selon le type
		langChainNode := map[string]any{
			"id":   node.ID,
			"type": node.Type,
		}

		// Ajouter les propriétés spécifiques selon le type de nœud
		switch node.Type {
		case "llm":
			// Configurer un nœud LLM pour LangChain
			langChainNode["model"] = nodeData["modelType"]
			langChainNode["prompt"] = nodeData["prompt"]

			// Paramètres du modèle
			langChainNode["parameters"] = map[string]any{
				"temperature": nodeData["temperature"],
				"maxTokens":   nodeData["maxTokens"],
			}

			// Ajouter les informations d'authentification si nécessaire
			if credIDStr, ok := nodeData["credentialId"].(string); ok && credIDStr != "" {
				credID, err := uuid.Parse(credIDStr)
				if err != nil {
					return fmt.Errorf("ID de credential invalide: %w", err)
				}

				credential, err := project.getCredential(credID)
				if err != nil {
					return fmt.Errorf("credential non trouvé: %w", err)
				}

				// Ajouter les informations d'authentification
				langChainNode["auth"] = map[string]any{
					"provider": string(credential.ProviderType),
					"apiKey":   credential.APIKey,
				}
			}

		case "prompt":
			// Configurer un nœud de prompt pour LangChain
			langChainNode["template"] = nodeData["template"]
			langChainNode["variables"] = nodeData["variables"]

		case "retriever":
			// Configurer un nœud de récupération de documents
			langChainNode["source"] = nodeData["source"]
			langChainNode["options"] = nodeData["options"]

		case "tool":
			// Configurer un outil (par exemple, recherche web, calculatrice, etc.)
			langChainNode["toolName"] = nodeData["toolName"]
			langChainNode["parameters"] = nodeData["parameters"]

		case "output":
			// Configurer un nœud de sortie
			langChainNode["format"] = nodeData["format"]

			// Ajouter d'autres types selon vos besoins
		}

		// Ajouter le nœud à la définition LangChain
		computed.Nodes[node.ID] = langChainNode
	}

	// Transformer les arêtes en connexions LangChain
	for _, edge := range w.Definition.Edges {
		connection := map[string]any{
			"from": edge.Source,
			"to":   edge.Target,
		}

		// Ajouter des informations sur les ports si disponibles
		if edge.SourceHandle != "" {
			connection["fromPort"] = edge.SourceHandle
		}
		if edge.TargetHandle != "" {
			connection["toPort"] = edge.TargetHandle
		}

		// Déterminer le type de données transmises si possible
		if edge.SourceHandle != "" {
			connection["dataType"] = inferDataTypeFromHandle(edge.SourceHandle)
		}

		computed.Connections = append(computed.Connections, connection)
	}

	// Ajouter des métadonnées pour le runner
	computed.Metadata = map[string]any{
		"optimizedFor": "langchain",
		"version":      "1.0",
		"projectId":    w.ProjectID.String(),
		"createdAt":    time.Now().Format(time.RFC3339),
	}

	// Configuration globale
	computed.Configuration = map[string]any{
		"executionMode": "sequential",  // ou "parallel" selon votre besoin
		"errorHandling": "stopOnError", // ou "continueOnError"
		"timeout":       60,            // timeout en secondes
	}

	// Sérialiser la définition calculée
	computedJSON, err := json.Marshal(computed)
	if err != nil {
		return fmt.Errorf("erreur lors de la sérialisation de la définition calculée: %w", err)
	}

	// Stocker la définition calculée
	var rawComputed json.RawMessage = computedJSON
	w.ComputedDef = ComputedDef{
		Chain:         computed.Chain,
		Nodes:         computed.Nodes,
		Connections:   computed.Connections,
		Metadata:      computed.Metadata,
		Configuration: computed.Configuration,
	}

	return nil
}

// inferDataTypeFromHandle tente de déterminer le type de données à partir du handle
func inferDataTypeFromHandle(handle string) string {
	// Logique pour inférer le type de données
	// Par exemple, si le handle est "output-text", on peut retourner "text"
	// Cette fonction peut être étendue selon vos besoins spécifiques

	// Exemple simple:
	switch {
	case handle == "output-text" || handle == "text":
		return "text"
	case handle == "output-json" || handle == "json":
		return "json"
	case handle == "output-image" || handle == "image":
		return "image"
	default:
		return "unknown"
	}
}

// GetWorkflowJSONSchema returns the JSON schema for validating workflows
func GetWorkflowJSONSchema() (string, error) {
	schemaBytes, err := schemaFS.ReadFile("schemas/workflow_schema.json")
	if err != nil {
		return "", fmt.Errorf("error reading JSON schema: %w", err)
	}
	return string(schemaBytes), nil
}

type workflowValidator struct {
	schema *gojsonschema.Schema
}

func newWorkflowValidator() (*workflowValidator, error) {
	schemaStr, err := GetWorkflowJSONSchema()
	if err != nil {
		return nil, err
	}

	schemaLoader := gojsonschema.NewStringLoader(schemaStr)
	schema, err := gojsonschema.NewSchema(schemaLoader)
	if err != nil {
		return nil, fmt.Errorf("failed to load workflow schema: %w", err)
	}

	return &workflowValidator{
		schema: schema,
	}, nil
}

// ValidateWorkflowJSON validates a workflow definition in JSON format
func (p *Project) ValidateWorkflowJSON(workflowJSON string) error {
	v, err := newWorkflowValidator()
	if err != nil {
		return fmt.Errorf("error creating workflow validator: %w", err)
	}
	documentLoader := gojsonschema.NewStringLoader(workflowJSON)
	result, err := v.schema.Validate(documentLoader)
	if err != nil {
		return fmt.Errorf("validation error: %w", err)
	}

	if !result.Valid() {
		var errors []string
		for _, err := range result.Errors() {
			errors = append(errors, err.String())
		}
		return fmt.Errorf("validation errors: %w", errors)
	}

	return nil
}
