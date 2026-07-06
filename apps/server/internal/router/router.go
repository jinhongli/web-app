package router

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/web-app/server/internal/auth"
	"github.com/web-app/server/internal/handler"
	"github.com/web-app/server/internal/middleware"
	"github.com/web-app/server/internal/service"
)

// Deps carries the dependencies required to build the router.
type Deps struct {
	Logger      *slog.Logger
	TokenMgr    *auth.Manager
	AuthService *service.AuthService
	UserService *service.UserService
}

// New builds the Gin engine with all routes and middleware.
func New(deps Deps) *gin.Engine {
	engine := gin.New()
	engine.Use(gin.Recovery())
	engine.Use(middleware.RequestLogger(deps.Logger))
	engine.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}))

	authHandler := handler.NewAuthHandler(deps.AuthService)
	userHandler := handler.NewUserHandler(deps.UserService)

	engine.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := engine.Group("/api")
	{
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/register", authHandler.Register)
			authGroup.POST("/login", authHandler.Login)
			authGroup.POST("/refresh", authHandler.Refresh)
		}

		users := api.Group("/users")
		users.Use(middleware.Auth(deps.TokenMgr))
		{
			users.GET("/me", userHandler.Me)
			users.GET("", middleware.RequireAdmin(), userHandler.List)
			users.GET("/:id", middleware.RequireAdmin(), userHandler.Get)
			users.PATCH("/:id", middleware.RequireAdmin(), userHandler.Update)
		}
	}

	return engine
}
