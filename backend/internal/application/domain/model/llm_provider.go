package model

type (
	LLMProviderType string
	LLMModel        string
)

func (t LLMProviderType) String() string {
	return string(t)
}

func (t LLMModel) String() string {
	return string(t)
}

const (
	ProviderTypeOpenAI    LLMProviderType = "openai"
	ProviderTypeAnthropic LLMProviderType = "anthropic"

	ModelGPT4o     LLMModel = "gpt-4o"
	ModelGPT4oMini LLMModel = "gpt-4o-mini"

	ModelClaude37Sonnet LLMModel = "claude-3-7-sonnet"
	ModelClaude35Sonnet LLMModel = "claude-3-5-sonnet"
	ModelClaude35Haiku  LLMModel = "claude-3-5-haiku"
)

var providerModels = map[LLMProviderType]map[LLMModel]struct{}{
	ProviderTypeOpenAI: {
		ModelGPT4o:     {},
		ModelGPT4oMini: {},
	},
	ProviderTypeAnthropic: {
		ModelClaude37Sonnet: {},
		ModelClaude35Sonnet: {},
		ModelClaude35Haiku:  {},
	},
}
