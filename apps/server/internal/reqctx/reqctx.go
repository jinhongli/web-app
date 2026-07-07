// Package reqctx carries request-scoped correlation values (trace id, user id,
// method, path) on a context.Context so the logging layer can enrich records
// without importing the middleware or gin packages.
package reqctx

import "context"

type contextKey int

const (
	traceIDKey contextKey = iota
	userIDKey
	methodKey
	pathKey
)

// WithTraceID returns a context carrying the trace id.
func WithTraceID(ctx context.Context, id string) context.Context {
	return context.WithValue(ctx, traceIDKey, id)
}

// TraceID reads the trace id from the context, or "" if absent.
func TraceID(ctx context.Context) string {
	return stringValue(ctx, traceIDKey)
}

// WithUserID returns a context carrying the authenticated user id.
func WithUserID(ctx context.Context, id string) context.Context {
	return context.WithValue(ctx, userIDKey, id)
}

// UserID reads the user id from the context, or "" if absent.
func UserID(ctx context.Context) string {
	return stringValue(ctx, userIDKey)
}

// WithMethod returns a context carrying the request method.
func WithMethod(ctx context.Context, method string) context.Context {
	return context.WithValue(ctx, methodKey, method)
}

// Method reads the request method from the context, or "" if absent.
func Method(ctx context.Context) string {
	return stringValue(ctx, methodKey)
}

// WithPath returns a context carrying the request path.
func WithPath(ctx context.Context, path string) context.Context {
	return context.WithValue(ctx, pathKey, path)
}

// Path reads the request path from the context, or "" if absent.
func Path(ctx context.Context) string {
	return stringValue(ctx, pathKey)
}

func stringValue(ctx context.Context, key contextKey) string {
	if v, ok := ctx.Value(key).(string); ok {
		return v
	}
	return ""
}
