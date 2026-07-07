package handler

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/web-app/server/internal/repository"
	"github.com/web-app/server/internal/service"
)

// RequestLogHandler exposes the log query endpoints.
type RequestLogHandler struct {
	logs *service.RequestLogService
}

// NewRequestLogHandler builds a RequestLogHandler.
func NewRequestLogHandler(logs *service.RequestLogService) *RequestLogHandler {
	return &RequestLogHandler{logs: logs}
}

// List handles GET /api/logs.
func (h *RequestLogHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	filter := repository.LogFilter{
		Keyword: c.Query("keyword"),
		UserID:  c.Query("userId"),
		Level:   c.Query("level"),
	}
	if from, err := time.Parse(time.RFC3339, c.Query("from")); err == nil {
		filter.From = from
	}
	if to, err := time.Parse(time.RFC3339, c.Query("to")); err == nil {
		filter.To = to
	}

	result, err := h.logs.List(c.Request.Context(), page, pageSize, filter)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "internal", "failed to list logs")
		return
	}

	items := make([]requestLogDTO, 0, len(result.Items))
	for i := range result.Items {
		items = append(items, toRequestLogDTO(&result.Items[i]))
	}

	c.JSON(http.StatusOK, logsPageDTO{
		Items:    items,
		Total:    result.Total,
		Page:     result.Page,
		PageSize: result.PageSize,
	})
}

// Get handles GET /api/logs/:id.
func (h *RequestLogHandler) Get(c *gin.Context) {
	entry, err := h.logs.Get(c.Request.Context(), c.Param("id"))
	if errors.Is(err, service.ErrLogNotFound) {
		respondError(c, http.StatusNotFound, "not_found", "log not found")
		return
	}
	if err != nil {
		respondError(c, http.StatusInternalServerError, "internal", "failed to load log")
		return
	}
	c.JSON(http.StatusOK, toRequestLogDTO(entry))
}

// Chain handles GET /api/logs/:id/chain.
func (h *RequestLogHandler) Chain(c *gin.Context) {
	traceID, entries, err := h.logs.Chain(c.Request.Context(), c.Param("id"))
	if errors.Is(err, service.ErrLogNotFound) {
		respondError(c, http.StatusNotFound, "not_found", "log not found")
		return
	}
	if err != nil {
		respondError(c, http.StatusInternalServerError, "internal", "failed to load log chain")
		return
	}

	items := make([]requestLogDTO, 0, len(entries))
	for i := range entries {
		items = append(items, toRequestLogDTO(&entries[i]))
	}

	c.JSON(http.StatusOK, logChainDTO{TraceID: traceID, Items: items})
}
