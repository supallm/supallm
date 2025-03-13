package server

import (
	"context"
	"net/http"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type userIDKeyType string

const (
	userIDKey userIDKeyType = "userID"
	maxAge    int           = 300
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
	s.Router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
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
