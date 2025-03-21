package http

import (
	"errors"
	"net/http"

	"github.com/supallm/core/internal/application/command"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/infra/http/gen"
	"github.com/supallm/core/internal/pkg/errs"
)

func (s *Server) Login(w http.ResponseWriter, r *http.Request) {
	var req gen.LoginRequest
	if err := s.server.ParseBody(r, &req); err != nil {
		s.server.RespondErr(w, r, err)
		return
	}
	result, err := s.app.Commands.CreateJWT.Handle(r.Context(), command.CreateJWTCommand{
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	user, err := s.app.Queries.GetUser.Handle(r.Context(), query.GetUserQuery{
		Email: req.Email,
	})
	if err != nil {
		s.server.RespondErr(w, r, err)
		return
	}

	s.server.Respond(w, r, http.StatusOK, gen.LoginResponse{
		Token: result.String(),
		User: gen.User{
			Id:    user.ID,
			Email: user.Email,
			Name:  user.Name,
		},
	})
}

func (s *Server) GetMe(w http.ResponseWriter, r *http.Request) {
	user := s.server.GetUser(r.Context())
	if user == nil {
		s.server.RespondErr(w, r, errs.UnauthorizedError{Err: errors.New("user not found")})
		return
	}
	s.server.Respond(w, r, http.StatusOK, user)
}
