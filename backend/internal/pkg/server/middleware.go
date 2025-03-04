package server

import (
	"strings"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/gofiber/fiber/v2"
)

func (s *Server) storeUser(c *fiber.Ctx, user *clerk.User) {
	c.Locals("user", user)
}

func (s *Server) GetUser(c *fiber.Ctx) *clerk.User {
	return c.Locals("user").(*clerk.User)
}

func (s *Server) ClerkAuthMiddleware() fiber.Handler {
	clerk.SetKey(s.conf.Clerk.SecretKey)

	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		sessionToken := strings.TrimPrefix(authHeader, "Bearer ")

		if sessionToken == "" || sessionToken == authHeader {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or missing authorization token",
			})
		}

		claims, err := jwt.Verify(c.Context(), &jwt.VerifyParams{
			Token: sessionToken,
		})
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Unauthorized: invalid token",
			})
		}

		usr, err := user.Get(c.Context(), claims.Subject)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to retrieve user information",
			})
		}

		if usr.Banned {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "User is banned",
			})
		}

		s.storeUser(c, usr)
		return c.Next()
	}
}
