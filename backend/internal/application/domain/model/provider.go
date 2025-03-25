package model

type (
	ProviderType string
)

func (t ProviderType) String() string {
	return string(t)
}

const (
	ProviderTypeOpenAI    ProviderType = "openai"
	ProviderTypeAnthropic ProviderType = "anthropic"
	ProviderTypeMistral   ProviderType = "mistral"
	ProviderTypeGroq      ProviderType = "groq"
	ProviderTypeGemini    ProviderType = "gemini"
	ProviderTypeDeepSeek  ProviderType = "deepseek"

	ProviderTypeE2B ProviderType = "e2b"
)
