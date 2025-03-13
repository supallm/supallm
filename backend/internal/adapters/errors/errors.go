package errors

type RepoError string

func (e RepoError) Error() string {
	return string(e)
}

const (
	ErrNotFound  RepoError = "not found"
	ErrDuplicate RepoError = "duplicate"
	ErrInvalid   RepoError = "invalid"
	ErrInternal  RepoError = "internal"
)
