package http

import (
	"net/http"

	"github.com/supallm/core/internal/application/command"
	"github.com/supallm/core/internal/application/query"
	"github.com/supallm/core/internal/infra/http/gen"
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

	resp := gen.LoginResponse{
		Token: result.String(),
		User: gen.User{
			Id:    user.ID,
			Email: user.Email,
			Name:  user.Name,
		},
	}

	s.server.Respond(w, r, http.StatusOK, resp)
}
