package model

type (
	ProviderType string
)

func (t ProviderType) String() string {
	return string(t)
}
