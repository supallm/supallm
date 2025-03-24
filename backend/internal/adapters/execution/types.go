package execution

type Execution struct {
	WorkflowID     string                   `json:"workflowId"`
	SessionID      string                   `json:"sessionId"`
	TriggerID      string                   `json:"triggerId"`
	WorkflowInputs WorkflowInputs           `json:"workflowInputs"`
	NodeExecutions map[string]NodeExecution `json:"nodeExecutions"`
	CompletedNodes []string                 `json:"completedNodes"`
	AllNodes       []string                 `json:"allNodes"`
}

type WorkflowInputs struct {
	Prompt string `json:"prompt"`
}

type NodeExecution struct {
	ID            string         `json:"id"`
	Success       bool           `json:"success"`
	Inputs        map[string]any `json:"inputs"`
	Output        map[string]any `json:"output"`
	ExecutionTime int            `json:"executionTime"`
}
