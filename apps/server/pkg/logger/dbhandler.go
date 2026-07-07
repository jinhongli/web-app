package logger

import (
	"context"
	"encoding/json"
	"log/slog"
	"os"
	"time"

	"github.com/web-app/server/internal/reqctx"
)

// Record is a persisted log entry, enriched with request-scoped correlation
// values. It is what a Sink writes to durable storage.
type Record struct {
	TraceID   string
	Level     string
	Message   string
	Method    string
	Path      string
	Status    int
	LatencyMs int64
	IP        string
	UserID    string
	Attrs     string
	Time      time.Time
}

// Sink persists log records. Implementations must be non-recursive: they must
// never emit through slog, or the handler would loop.
type Sink interface {
	Write(ctx context.Context, rec Record)
}

// DBHandler wraps a base slog.Handler, forwarding to it for console output and
// additionally shipping each record to a Sink enriched with correlation data.
type DBHandler struct {
	base  slog.Handler
	sink  Sink
	attrs []slog.Attr
}

// NewWithSink builds a logger that mirrors New's console output while also
// persisting records via the sink. It is installed as the default logger once
// the database is available.
func NewWithSink(env string, sink Sink) *slog.Logger {
	level := slog.LevelInfo
	if env == "development" {
		level = slog.LevelDebug
	}

	var base slog.Handler
	opts := &slog.HandlerOptions{Level: level}
	if env == "development" {
		base = slog.NewTextHandler(os.Stdout, opts)
	} else {
		base = slog.NewJSONHandler(os.Stdout, opts)
	}

	logger := slog.New(&DBHandler{base: base, sink: sink})
	slog.SetDefault(logger)
	return logger
}

// Enabled reports whether the base handler handles the level.
func (h *DBHandler) Enabled(ctx context.Context, level slog.Level) bool {
	return h.base.Enabled(ctx, level)
}

// Handle forwards to the base handler, then persists records at Info level and
// above (debug stays console-only).
func (h *DBHandler) Handle(ctx context.Context, r slog.Record) error {
	err := h.base.Handle(ctx, r)

	if h.sink != nil && r.Level >= slog.LevelInfo {
		h.sink.Write(ctx, h.toRecord(ctx, r))
	}
	return err
}

// WithAttrs returns a handler that includes the given attributes on every record.
func (h *DBHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	merged := make([]slog.Attr, 0, len(h.attrs)+len(attrs))
	merged = append(merged, h.attrs...)
	merged = append(merged, attrs...)
	return &DBHandler{base: h.base.WithAttrs(attrs), sink: h.sink, attrs: merged}
}

// WithGroup delegates grouping to the base handler.
func (h *DBHandler) WithGroup(name string) slog.Handler {
	return &DBHandler{base: h.base.WithGroup(name), sink: h.sink, attrs: h.attrs}
}

func (h *DBHandler) toRecord(ctx context.Context, r slog.Record) Record {
	rec := Record{
		TraceID: reqctx.TraceID(ctx),
		Level:   r.Level.String(),
		Message: r.Message,
		Method:  reqctx.Method(ctx),
		Path:    reqctx.Path(ctx),
		UserID:  reqctx.UserID(ctx),
		Time:    r.Time,
	}

	extra := map[string]any{}
	collect := func(a slog.Attr) bool {
		switch a.Key {
		case "status":
			rec.Status = int(a.Value.Int64())
		case "latencyMs":
			rec.LatencyMs = a.Value.Int64()
		case "ip":
			rec.IP = a.Value.String()
		default:
			extra[a.Key] = a.Value.Any()
		}
		return true
	}
	for _, a := range h.attrs {
		collect(a)
	}
	r.Attrs(func(a slog.Attr) bool { return collect(a) })

	if len(extra) > 0 {
		if b, err := json.Marshal(extra); err == nil {
			rec.Attrs = string(b)
		}
	}
	if rec.Level == "" {
		rec.Level = "INFO"
	}
	if rec.Time.IsZero() {
		rec.Time = time.Now()
	}
	return rec
}
