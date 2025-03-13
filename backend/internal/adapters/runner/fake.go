package runner

import (
	"encoding/json"
	"errors"
	"os"
)

const (
	maxTokens   = 3000
	temperature = 0.5
)

func getRunnerConfig() (json.RawMessage, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, errors.New("OPENAI_API_KEY is not set")
	}

	config := map[string]any{
		"nodes": map[string]any{
			"entrypoint": map[string]any{
				"type": "entrypoint",
				"outputs": map[string]any{
					"prompt": map[string]any{
						"type": "string",
					},
				},
			},
			"e4fd228c-08a5-4075-a134-9ea6772ef80a": map[string]any{
				"type":        "llm",
				"provider":    "openai",
				"model":       "gpt-4o",
				"temperature": temperature,
				"maxTokens":   maxTokens,
				//nolint:all
				"systemPrompt": "Lorsqu'on te demande des idées de contenu, utilise le {{format 4A}} et propose des idées originales adaptées et engageantes sur le sujet que tu reçois",
				"streaming":    true,
				"apiKey":       apiKey,
				"inputs": map[string]any{
					"prompt": map[string]any{
						"source": "entrypoint.prompt",
					},
				},
				"outputs": map[string]any{
					"response": map[string]any{
						"type": "string",
					},
					"responseStream": map[string]any{
						"type":        "stream",
						"outputField": "idea",
					},
				},
			},
			"60c7bd2e-f5e6-4949-b648-591e262d54ea": map[string]any{
				"type":         "llm",
				"provider":     "openai",
				"model":        "gpt-4o-mini",
				"temperature":  temperature,
				"maxTokens":    maxTokens,
				"systemPrompt": "Génère moi un hook pour un post linkedin basé sur le texte qu'on te donne",
				"streaming":    true,
				"apiKey":       apiKey,
				"inputs": map[string]any{
					"prompt": map[string]any{
						"source": "e4fd228c-08a5-4075-a134-9ea6772ef80a.response",
					},
				},
				"outputs": map[string]any{
					"response": map[string]any{
						"type": "string",
					},
					"responseStream": map[string]any{
						"type":        "stream",
						"outputField": "hook",
					},
				},
			},
			"result": map[string]any{
				"type": "result",
				"inputs": map[string]any{
					"hook": map[string]any{
						"type": "stream",
					},
					"idea": map[string]any{
						"type": "stream",
					},
				},
			},
		},
	}

	rawConfig, err := json.Marshal(config)
	if err != nil {
		return nil, err
	}

	return rawConfig, nil
}
