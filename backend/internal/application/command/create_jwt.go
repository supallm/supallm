package command

import (
	"context"
	"errors"

	"github.com/supallm/core/internal/application/domain/repository"
	"github.com/supallm/core/internal/pkg/auth"
	"github.com/supallm/core/internal/pkg/errs"
)

type CreateJWTCommand struct {
	Email    string
	Password string
}

type CreateJWTHandler struct {
	userRepo repository.UserRepository
	authKey  string
}

func NewCreateJWTHandler(userRepo repository.UserRepository, authKey string) CreateJWTHandler {
	return CreateJWTHandler{
		userRepo: userRepo,
		authKey:  authKey,
	}
}

func (h *CreateJWTHandler) Handle(ctx context.Context, cmd CreateJWTCommand) (auth.Token, error) {
	u, err := h.userRepo.GetUserByEmail(ctx, cmd.Email)
	if err != nil {
		var notFoundErr errs.NotFoundError
		if errors.As(err, &notFoundErr) {
			return "", errs.UnauthorizedError{
				Err: errors.New("invalid email or password"),
			}
		}
		return "", err
	}

	if !auth.CheckPassword(cmd.Password, u.PasswordHash) {
		return "", errs.UnauthorizedError{
			Err: errors.New("invalid email or password"),
		}
	}

	token, err := auth.GenerateToken(u.ID, u.Email, u.Name, h.authKey)
	if err != nil {
		return "", errs.InternalError{
			Err: errors.New("authentication failed"),
		}
	}

	return token, nil
}
