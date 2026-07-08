package middleware

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/web-app/server/internal/model"
	"github.com/web-app/server/internal/reqctx"
)

// requestIDHeader is the response header carrying the trace id.
const requestIDHeader = "X-Request-Id"

// Tracing assigns each request a trace id, seeds the request context with the
// trace id plus method/path (so downstream logs are correlated), and echoes the
// id back in the X-Request-Id response header.
func Tracing() gin.HandlerFunc {
	return func(c *gin.Context) {
		traceID := uuid.NewString()

		ctx := c.Request.Context()
		ctx = reqctx.WithTraceID(ctx, traceID)
		ctx = reqctx.WithMethod(ctx, c.Request.Method)
		ctx = reqctx.WithPath(ctx, c.Request.URL.Path)
		c.Request = c.Request.WithContext(ctx)

		c.Set(ContextTraceID, traceID)
		c.Writer.Header().Set(requestIDHeader, traceID)
		c.Next()
	}
}

// RequestLogger logs each request as the summary row of its call chain, with a
// severity derived from the response status.
func RequestLogger(logger *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()

		status := c.Writer.Status()
		logger.LogAttrs(c.Request.Context(), levelForStatus(status), model.RequestSummaryMessage,
			slog.String("method", c.Request.Method),
			slog.String("path", c.Request.URL.Path),
			slog.Int("status", status),
			slog.Int64("latencyMs", time.Since(start).Milliseconds()),
			slog.String("ip", c.ClientIP()),
		)
	}
}

func levelForStatus(status int) slog.Level {
	switch {
	case status >= http.StatusInternalServerError:
		return slog.LevelError
	case status >= http.StatusBadRequest:
		return slog.LevelWarn
	default:
		return slog.LevelInfo
	}
}
