package handler

import (
	"time"

	"github.com/web-app/server/internal/model"
)

// userDTO is the wire representation of a user (no password hash).
type userDTO struct {
	ID        string     `json:"id"`
	Email     string     `json:"email"`
	Name      string     `json:"name"`
	Role      model.Role `json:"role"`
	CreatedAt string     `json:"createdAt"`
	UpdatedAt string     `json:"updatedAt"`
}

func toUserDTO(u *model.User) userDTO {
	return userDTO{
		ID:        u.ID,
		Email:     u.Email,
		Name:      u.Name,
		Role:      u.Role,
		CreatedAt: u.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt: u.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

type tokensDTO struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

type authResultDTO struct {
	User   userDTO   `json:"user"`
	Tokens tokensDTO `json:"tokens"`
}

// requestLogDTO is the wire representation of a persisted log entry.
type requestLogDTO struct {
	ID        string `json:"id"`
	TraceID   string `json:"traceId"`
	Level     string `json:"level"`
	Message   string `json:"message"`
	Method    string `json:"method"`
	Path      string `json:"path"`
	Status    int    `json:"status"`
	LatencyMs int64  `json:"latencyMs"`
	IP        string `json:"ip"`
	UserID    string `json:"userId"`
	Attrs     string `json:"attrs"`
	CreatedAt string `json:"createdAt"`
}

func toRequestLogDTO(l *model.RequestLog) requestLogDTO {
	return requestLogDTO{
		ID:        l.ID,
		TraceID:   l.TraceID,
		Level:     string(l.Level),
		Message:   l.Message,
		Method:    l.Method,
		Path:      l.Path,
		Status:    l.Status,
		LatencyMs: l.LatencyMs,
		IP:        l.IP,
		UserID:    l.UserID,
		Attrs:     l.Attrs,
		CreatedAt: l.CreatedAt.UTC().Format(time.RFC3339),
	}
}

type logsPageDTO struct {
	Items    []requestLogDTO `json:"items"`
	Total    int64           `json:"total"`
	Page     int             `json:"page"`
	PageSize int             `json:"pageSize"`
}

type logChainDTO struct {
	TraceID string          `json:"traceId"`
	Items   []requestLogDTO `json:"items"`
}
