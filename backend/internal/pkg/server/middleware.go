package server

import (
	"context"
	"errors"
	"log/slog"
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
	originContextKey    contextKey = "origin"

	xSecretKeyHeader     string = "X-Secret-Key"
	xRequestOriginHeader string = "x-request-origin"

	dashboardOrigin string = "dashboard"
)

func (s *Server) storeUser(r *http.Request, user auth.User) *http.Request {
	return r.WithContext(context.WithValue(r.Context(), userIDKey, user))
}

func (s *Server) GetUser(ctx context.Context) *auth.User {
	user, ok := ctx.Value(userIDKey).(auth.User)
	if !ok {
		return nil
	}
	return &user
}

func (s *Server) storeOrigin(r *http.Request, origin string) *http.Request {
	return r.WithContext(context.WithValue(r.Context(), originContextKey, origin))
}

func (s *Server) IsDashboardOrigin(ctx context.Context) bool {
	origin, ok := ctx.Value(originContextKey).(string)
	if !ok {
		slog.Error("origin not found in context")
		return false
	}
	return origin == dashboardOrigin
}

func (s *Server) storeSecretKey(r *http.Request, secretKey string) *http.Request {
	return r.WithContext(context.WithValue(r.Context(), secretKeyContextKey, secretKey))
}

func (s *Server) GetSecretKeyFromContext(ctx context.Context) (secret.APIKey, error) {
	if secretKey, ok := ctx.Value(secretKeyContextKey).(string); ok {
		return secret.APIKey(secretKey), nil
	}
	return "", errs.UnauthorizedError{
		Err: errors.New("secret key is required"),
	}
}

func (s *Server) applyCommonMiddleware() {
	s.Router.Use(middleware.RequestID)
	s.Router.Use(middleware.Recoverer)
	s.Router.Use(middleware.Logger)
	s.Router.Use(s.populateContext)
	s.Router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
			"X-CSRF-Token",
			xSecretKeyHeader,
			xRequestOriginHeader,
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

		claims, err := s.parseBearerToken(r)
		if err != nil {
			s.RespondErr(w, r, err)
			return
		}

		r = s.storeUser(r, auth.User{
			ID:    claims.UserID.String(),
			Email: claims.Email,
			Name:  claims.Name,
		})
		next.ServeHTTP(w, r)
	})
}

func (s *Server) parseBearerToken(r *http.Request) (*auth.Claims, error) {
	authHeader := r.Header.Get("Authorization")
	sessionToken := strings.TrimPrefix(authHeader, "Bearer ")

	if sessionToken == "" || sessionToken == authHeader {
		return nil, errs.UnauthorizedError{
			Err: errors.New("invalid or missing authorization token"),
		}
	}

	claims, err := auth.VerifyToken(sessionToken, s.conf.Auth.SecretKey)
	if err != nil {
		return nil, errs.UnauthorizedError{
			Err: err,
		}
	}

	return claims, nil
}

func (s *Server) populateContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//nolint
		origin := r.Header.Get(xRequestOriginHeader)
		r = s.storeOrigin(r, origin)

		if origin == dashboardOrigin {
			claims, err := s.parseBearerToken(r)
			if err != nil {
				s.RespondErr(w, r, err)
				return
			}

			r = s.storeUser(r, auth.User{
				ID:    claims.UserID.String(),
				Email: claims.Email,
				Name:  claims.Name,
			})

			next.ServeHTTP(w, r)
			return
		}

		secretKey := r.Header.Get(xSecretKeyHeader)
		if secretKey != "" {
			r = s.storeSecretKey(r, secretKey)
		}

		next.ServeHTTP(w, r)
	})
}
