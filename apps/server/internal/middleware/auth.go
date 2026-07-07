package middleware

import (
	"log/slog"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/web-app/server/internal/auth"
	"github.com/web-app/server/internal/model"
	"github.com/web-app/server/internal/reqctx"
)

const (
	// ContextUserID is the gin context key for the authenticated user id.
	ContextUserID = "userID"
	// ContextUserRole is the gin context key for the authenticated user role.
	ContextUserRole = "userRole"
	// ContextTraceID is the gin context key for the request trace id.
	ContextTraceID = "traceID"
)

// Auth returns middleware that validates the bearer access token.
func Auth(manager *auth.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		token, ok := strings.CutPrefix(header, "Bearer ")
		if !ok || token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code":    "unauthorized",
				"message": "missing bearer token",
			})
			return
		}

		claims, err := manager.Parse(token)
		if err != nil || claims.Type != auth.AccessToken {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code":    "unauthorized",
				"message": "invalid or expired token",
			})
			return
		}

		c.Set(ContextUserID, claims.UserID)
		c.Set(ContextUserRole, claims.Role)

		ctx := reqctx.WithUserID(c.Request.Context(), claims.UserID)
		c.Request = c.Request.WithContext(ctx)
		slog.InfoContext(ctx, "auth.authorized", slog.String("role", string(claims.Role)))

		c.Next()
	}
}

// RequireAdmin ensures the authenticated user has the admin role.
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get(ContextUserRole)
		if role != model.RoleAdmin {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"code":    "forbidden",
				"message": "admin access required",
			})
			return
		}
		c.Next()
	}
}
