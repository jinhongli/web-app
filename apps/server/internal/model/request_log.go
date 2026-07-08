package model

import "time"

// LogLevel enumerates the persisted log severities.
type LogLevel string

const (
	LogLevelDebug LogLevel = "debug"
	LogLevelInfo  LogLevel = "info"
	LogLevelWarn  LogLevel = "warn"
	LogLevelError LogLevel = "error"
)

// RequestSummaryMessage is the message the request-logger middleware uses for
// the per-request summary row. Internal function logs share the trace id but
// carry their own messages, so this value distinguishes the two.
const RequestSummaryMessage = "request"

// RequestLog is an append-only structured log entry. Entries sharing a TraceID
// form the call chain of a single request. It never stores request or response
// bodies.
type RequestLog struct {
	ID        string    `gorm:"type:uuid;primaryKey" json:"id"`
	TraceID   string    `gorm:"type:uuid;index" json:"traceId"`
	Level     LogLevel  `gorm:"type:varchar(16);index" json:"level"`
	Message   string    `gorm:"not null" json:"message"`
	Method    string    `gorm:"index" json:"method"`
	Path      string    `gorm:"index" json:"path"`
	Status    int       `gorm:"index" json:"status"`
	LatencyMs int64     `json:"latencyMs"`
	IP        string    `json:"ip"`
	UserID    string    `gorm:"index" json:"userId"`
	Attrs     string    `gorm:"type:text" json:"attrs"`
	CreatedAt time.Time `gorm:"index" json:"createdAt"`
}
