package server

import (
	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/gofiber/fiber/v2"
)

func (s *Server) storeUserId(c *fiber.Ctx, userId string) {
	c.Locals("userId", userId)
}

func (s *Server) GetUserId(c *fiber.Ctx) string {
	return c.Locals("userId").(string)
}

func (s *Server) ClerkAuthMiddleware() fiber.Handler {
	clerk.SetKey(s.conf.Clerk.SecretKey)

	return func(c *fiber.Ctx) error {
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

		s.storeUserId(c, "12345")
		return c.Next()
	}
}
