package server

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/supallm/core/internal/pkg/auth"
	"github.com/supallm/core/internal/pkg/errs"
	"github.com/supallm/core/internal/pkg/secret"
)

type (
	userIDKeyType string
	contextKey    string
)

const (
	userIDKey userIDKeyType = "userID"
	maxAge    int           = 300

	secretKeyContextKey contextKey = "secret-key"
)

func (s *Server) storeUser(ctx context.Context, user auth.User) context.Context {
	return context.WithValue(ctx, userIDKey, user)
}

func (s *Server) GetUser(ctx context.Context) *auth.User {
	user, ok := ctx.Value(userIDKey).(auth.User)
	if !ok {
		return nil
	}
	return &user
}

func (s *Server) applyCommonMiddleware() {
	s.Router.Use(middleware.RequestID)
	s.Router.Use(middleware.Recoverer)
	s.Router.Use(middleware.Logger)
	s.Router.Use(s.withSecretKey)
	s.Router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
			"X-CSRF-Token",
			"X-Secret-Key",
			"x-request-origin",
		},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           maxAge,
	}))
}

func (s *Server) JWTAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/login" {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		sessionToken := strings.TrimPrefix(authHeader, "Bearer ")

		if sessionToken == "" || sessionToken == authHeader {
			s.RespondErr(w, r, errs.UnauthorizedError{
				Err: errors.New("invalid or missing authorization token"),
			})
			return
		}

		claims, err := auth.VerifyToken(sessionToken, s.conf.Auth.SecretKey)
		if err != nil {
			s.RespondErr(w, r, errs.UnauthorizedError{
				Err: err,
			})
			return
		}

		ctx := s.storeUser(r.Context(), auth.User{
			ID:    claims.UserID.String(),
			Email: claims.Email,
			Name:  claims.Name,
		})
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (s *Server) withSecretKey(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		secretKey := r.Header.Get("X-Secret-Key")
		if secretKey != "" {
			ctx := context.WithValue(r.Context(), secretKeyContextKey, secretKey)
			r = r.WithContext(ctx)
		}
		next.ServeHTTP(w, r)
	})
}

func (s *Server) GetSecretKeyFromContext(ctx context.Context) (secret.APIKey, error) {
	if secretKey, ok := ctx.Value(secretKeyContextKey).(string); ok {
		return secret.APIKey(secretKey), nil
	}
	return "", errs.UnauthorizedError{
		Err: errors.New("secret key is required"),
	}
}
