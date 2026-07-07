package service

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/web-app/server/internal/model"
	"github.com/web-app/server/internal/repository"
	"github.com/web-app/server/pkg/logger"
)

const logSinkBuffer = 1024

// RequestLogService persists structured logs and serves log queries. It
// implements logger.Sink using a buffered channel drained by a background
// goroutine, so logging never blocks request handling.
type RequestLogService struct {
	logs *repository.RequestLogRepository
	ch   chan model.RequestLog
}

// NewRequestLogService builds a RequestLogService and starts its writer.
func NewRequestLogService(logs *repository.RequestLogRepository) *RequestLogService {
	s := &RequestLogService{
		logs: logs,
		ch:   make(chan model.RequestLog, logSinkBuffer),
	}
	go s.drain()
	return s
}

// Write implements logger.Sink. It maps a record to a model and enqueues it,
// dropping the entry if the buffer is full so callers are never blocked. It
// must never emit through slog, which would recurse back into this sink.
func (s *RequestLogService) Write(_ context.Context, rec logger.Record) {
	// Skip the log feature's own traffic so browsing logs doesn't generate
	// more logs — otherwise each list/detail/chain call pollutes the table.
	if isLogPath(rec.Path) {
		return
	}

	entry := model.RequestLog{
		ID:        uuid.NewString(),
		TraceID:   rec.TraceID,
		Level:     toLogLevel(rec.Level),
		Message:   rec.Message,
		Method:    rec.Method,
		Path:      rec.Path,
		Status:    rec.Status,
		LatencyMs: rec.LatencyMs,
		IP:        rec.IP,
		UserID:    rec.UserID,
		Attrs:     rec.Attrs,
		CreatedAt: rec.Time,
	}
	if entry.CreatedAt.IsZero() {
		entry.CreatedAt = time.Now()
	}

	select {
	case s.ch <- entry:
	default:
		fmt.Fprintln(os.Stderr, "request-log sink buffer full, dropping entry")
	}
}

func (s *RequestLogService) drain() {
	for entry := range s.ch {
		e := entry
		if e.TraceID == "" {
			// Persisting a null uuid column would fail; skip untraced records.
			continue
		}
		if err := s.logs.Create(context.Background(), &e); err != nil {
			fmt.Fprintf(os.Stderr, "request-log sink write failed: %v\n", err)
		}
	}
}

func toLogLevel(level string) model.LogLevel {
	switch strings.ToUpper(level) {
	case "DEBUG":
		return model.LogLevelDebug
	case "WARN":
		return model.LogLevelWarn
	case "ERROR":
		return model.LogLevelError
	default:
		return model.LogLevelInfo
	}
}

// isLogPath reports whether a request path belongs to the log feature itself,
// so its traffic can be excluded from the persisted logs.
func isLogPath(path string) bool {
	return path == "/api/logs" || strings.HasPrefix(path, "/api/logs/")
}

// LogPage is a paginated slice of request logs.
type LogPage struct {
	Items    []model.RequestLog
	Total    int64
	Page     int
	PageSize int
}

// List returns a filtered page of logs.
func (s *RequestLogService) List(ctx context.Context, page, pageSize int, filter repository.LogFilter) (*LogPage, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize
	items, total, err := s.logs.List(ctx, filter, offset, pageSize)
	if err != nil {
		return nil, err
	}
	return &LogPage{Items: items, Total: total, Page: page, PageSize: pageSize}, nil
}

// Get returns a single log entry.
func (s *RequestLogService) Get(ctx context.Context, id string) (*model.RequestLog, error) {
	entry, err := s.logs.FindByID(ctx, id)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrLogNotFound
	}
	return entry, err
}

// Chain returns every log entry sharing the trace id of the given log, ordered
// oldest first, forming the request's call chain.
func (s *RequestLogService) Chain(ctx context.Context, id string) (string, []model.RequestLog, error) {
	entry, err := s.logs.FindByID(ctx, id)
	if errors.Is(err, repository.ErrNotFound) {
		return "", nil, ErrLogNotFound
	}
	if err != nil {
		return "", nil, err
	}
	items, err := s.logs.FindByTraceID(ctx, entry.TraceID)
	if err != nil {
		return "", nil, err
	}
	return entry.TraceID, items, nil
}
