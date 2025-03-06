package server

import (
	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/healthcheck"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
)

const userIDKey = "userID"

func (s *Server) storeUserID(c *fiber.Ctx, userID string) {
	c.Locals(userIDKey, userID)
}

func (s *Server) GetUserID(c *fiber.Ctx) string {
	id, ok := c.Locals(userIDKey).(string)
	if !ok {
		return ""
	}
	return id
}

func (s *Server) applyCommonMiddleware() {
	s.App.Use(helmet.New())
	s.App.Use(requestid.New())
	s.App.Use(recover.New())
	s.App.Use(logger.New())
	s.App.Use(healthcheck.New())
	s.App.Use(cors.New(cors.Config{
		AllowOrigins:  "*",
		AllowMethods:  "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders:  "Origin, Content-Type, Accept, Authorization",
		ExposeHeaders: "Content-Location",
	}))
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

		s.storeUserID(c, "12345")
		return c.Next()
	}
}
