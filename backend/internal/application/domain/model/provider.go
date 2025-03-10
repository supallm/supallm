package model

type (
	ProviderType  string
	ProviderModel string
)

func (t ProviderType) String() string {
	return string(t)
}

func (t ProviderModel) String() string {
	return string(t)
}

const (
	ProviderTypeOpenAI    ProviderType = "openai"
	ProviderTypeAnthropic ProviderType = "anthropic"

	ModelGPT4o     ProviderModel = "gpt-4o"
	ModelGPT4oMini ProviderModel = "gpt-4o-mini"

	ModelClaude37Sonnet ProviderModel = "claude-3-7-sonnet"
	ModelClaude35Sonnet ProviderModel = "claude-3-5-sonnet"
	ModelClaude35Haiku  ProviderModel = "claude-3-5-haiku"
)

//nolint:gochecknoglobals // map to be used in multiple files of this package
// var providerModels = map[ProviderType]map[ProviderModel]struct{}{
// 	ProviderTypeOpenAI: {
// 		ModelGPT4o:     {},
// 		ModelGPT4oMini: {},
// 	},
// 	ProviderTypeAnthropic: {
// 		ModelClaude37Sonnet: {},
// 		ModelClaude35Sonnet: {},
// 		ModelClaude35Haiku:  {},
// 	},
// }
