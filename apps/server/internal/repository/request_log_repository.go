package repository

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"github.com/web-app/server/internal/model"
)

// LogFilter narrows a request-log listing. Zero-value fields are ignored.
type LogFilter struct {
	Keyword string
	UserID  string
	Level   string
	From    time.Time
	To      time.Time
}

// RequestLogRepository provides data access for request logs.
type RequestLogRepository struct {
	db *gorm.DB
}

// NewRequestLogRepository builds a RequestLogRepository.
func NewRequestLogRepository(db *gorm.DB) *RequestLogRepository {
	return &RequestLogRepository{db: db}
}

// Create inserts a new log entry.
func (r *RequestLogRepository) Create(ctx context.Context, entry *model.RequestLog) error {
	return r.db.WithContext(ctx).Create(entry).Error
}

// FindByID looks up a single log entry.
func (r *RequestLogRepository) FindByID(ctx context.Context, id string) (*model.RequestLog, error) {
	var entry model.RequestLog
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&entry).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &entry, nil
}

// FindByTraceID returns every log entry sharing a trace id, oldest first, so
// callers can render the call chain in order.
func (r *RequestLogRepository) FindByTraceID(ctx context.Context, traceID string) ([]model.RequestLog, error) {
	var entries []model.RequestLog
	err := r.db.WithContext(ctx).
		Where("trace_id = ?", traceID).
		Order("created_at asc").
		Find(&entries).Error
	if err != nil {
		return nil, err
	}
	return entries, nil
}

// List returns a filtered page of log entries (newest first) and the total.
func (r *RequestLogRepository) List(ctx context.Context, filter LogFilter, offset, limit int) ([]model.RequestLog, int64, error) {
	var entries []model.RequestLog
	var total int64

	build := func() *gorm.DB {
		q := r.db.WithContext(ctx).Model(&model.RequestLog{})
		// Never surface the log feature's own traffic (also excludes any such
		// rows persisted before the sink began skipping them).
		q = q.Where("path <> ? AND path NOT LIKE ?", "/api/logs", "/api/logs/%")
		if filter.Keyword != "" {
			like := "%" + filter.Keyword + "%"
			// Keyword also matches the acting user's name, resolved through the
			// users table since logs only persist the user id.
			q = q.Where(
				"message ILIKE ? OR path ILIKE ? OR id::text = ? OR trace_id::text = ? OR user_id IN (SELECT id::text FROM users WHERE name ILIKE ?)",
				like, like, filter.Keyword, filter.Keyword, like,
			)
		}
		if filter.UserID != "" {
			q = q.Where("user_id = ?", filter.UserID)
		}
		if filter.Level != "" {
			q = q.Where("level = ?", filter.Level)
		}
		if !filter.From.IsZero() {
			q = q.Where("created_at >= ?", filter.From)
		}
		if !filter.To.IsZero() {
			q = q.Where("created_at <= ?", filter.To)
		}
		return q
	}

	if err := build().Count(&total).Error; err != nil {
		return nil, 0, err
	}
	err := build().
		Order("created_at desc").
		Offset(offset).
		Limit(limit).
		Find(&entries).Error
	if err != nil {
		return nil, 0, err
	}
	return entries, total, nil
}
