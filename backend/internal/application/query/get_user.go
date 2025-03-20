package query

import (
	"context"
	"errors"
	"log/slog"
	"os"

	reader "github.com/supallm/core/internal/adapters/errors"
	"github.com/supallm/core/internal/pkg/errs"
)

type GetUserQuery struct {
	Email string
}

type GetUserHandler struct {
	userReader UserReader
}

func NewGetUserHandler(userReader UserReader) GetUserHandler {
	if userReader == nil {
		slog.Error("userReader is nil")
		os.Exit(1)
	}

	return GetUserHandler{
		userReader: userReader,
	}
}

func (h GetUserHandler) Handle(ctx context.Context, query GetUserQuery) (User, error) {
	user, err := h.userReader.ReadUser(ctx, query.Email)
	if err != nil {
		if errors.Is(err, reader.ErrNotFound) {
			return User{}, errs.NotFoundError{Resource: "user", ID: query.Email, Err: err}
		}
		return User{}, errs.InternalError{Err: err}
	}

	return user, nil
}
