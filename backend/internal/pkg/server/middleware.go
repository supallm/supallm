package server

import (
	"context"
	"errors"
	"net/http"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
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

func (s *Server) storeUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDKey, userID)
}

func (s *Server) GetUserID(ctx context.Context) string {
	id, ok := ctx.Value(userIDKey).(string)
	if !ok {
		return ""
	}
	return id
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

func (s *Server) ClerkAuthMiddleware(next http.Handler) http.Handler {
	clerk.SetKey(s.conf.Clerk.SecretKey)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := s.storeUserID(r.Context(), "12345")
		next.ServeHTTP(w, r.WithContext(ctx))
		// authHeader := c.Get("Authorization")
		// sessionToken := strings.TrimPrefix(authHeader, "Bearer ")

		// if sessionToken == "" || sessionToken == authHeader {
		// 	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		// 		"error": "Invalid or missing authorization token",
		// 	})
		// }

		// claims, err := jwt.Verify(c.Context(), &jwt.VerifyParams{
		// 	Token: sessionToken,
		// })
		// if err != nil {
		// 	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		// 		"error": "Unauthorized: invalid token",
		// 	})
		// }

		// usr, err := user.Get(c.Context(), claims.Subject)
		// if err != nil {
		// 	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
		// 		"error": "Failed to retrieve user information",
		// 	})
		// }

		// if usr.Banned {
		// 	return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
		// 		"error": "User is banned",
		// 	})
		// }
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
