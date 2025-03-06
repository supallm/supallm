package project

type RepoError string

func (e RepoError) Error() string {
	return string(e)
}

const (
	//nolint:gosec // it's ok
	ErrCredentialNotFound RepoError = "credential not found"
	ErrModelNotFound      RepoError = "model not found"
	ErrProjectNotFound    RepoError = "project not found"
)
