package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/web-app/server/internal/middleware"
	"github.com/web-app/server/internal/model"
	"github.com/web-app/server/internal/service"
)

// UserHandler exposes the user endpoints.
type UserHandler struct {
	users *service.UserService
}

// NewUserHandler builds a UserHandler.
func NewUserHandler(users *service.UserService) *UserHandler {
	return &UserHandler{users: users}
}

// Me handles GET /api/users/me.
func (h *UserHandler) Me(c *gin.Context) {
	id := c.GetString(middleware.ContextUserID)
	user, err := h.users.GetByID(c.Request.Context(), id)
	if errors.Is(err, service.ErrUserNotFound) {
		respondError(c, http.StatusNotFound, "not_found", "user not found")
		return
	}
	if err != nil {
		respondError(c, http.StatusInternalServerError, "internal", "failed to load user")
		return
	}
	c.JSON(http.StatusOK, toUserDTO(user))
}

type usersPageDTO struct {
	Items    []userDTO `json:"items"`
	Total    int64     `json:"total"`
	Page     int       `json:"page"`
	PageSize int       `json:"pageSize"`
}

// List handles GET /api/users.
func (h *UserHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	result, err := h.users.List(c.Request.Context(), page, pageSize)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "internal", "failed to list users")
		return
	}

	items := make([]userDTO, 0, len(result.Items))
	for i := range result.Items {
		items = append(items, toUserDTO(&result.Items[i]))
	}

	c.JSON(http.StatusOK, usersPageDTO{
		Items:    items,
		Total:    result.Total,
		Page:     result.Page,
		PageSize: result.PageSize,
	})
}

// Get handles GET /api/users/:id.
func (h *UserHandler) Get(c *gin.Context) {
	user, err := h.users.GetByID(c.Request.Context(), c.Param("id"))
	if errors.Is(err, service.ErrUserNotFound) {
		respondError(c, http.StatusNotFound, "not_found", "user not found")
		return
	}
	if err != nil {
		respondError(c, http.StatusInternalServerError, "internal", "failed to load user")
		return
	}
	c.JSON(http.StatusOK, toUserDTO(user))
}

type updateUserRequest struct {
	Name *string     `json:"name" binding:"omitempty,min=1,max=64"`
	Role *model.Role `json:"role" binding:"omitempty,oneof=user admin"`
}

// Update handles PATCH /api/users/:id.
func (h *UserHandler) Update(c *gin.Context) {
	var req updateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "invalid_request", err.Error())
		return
	}

	user, err := h.users.Update(c.Request.Context(), c.Param("id"), service.UpdateInput{
		Name: req.Name,
		Role: req.Role,
	})
	if errors.Is(err, service.ErrUserNotFound) {
		respondError(c, http.StatusNotFound, "not_found", "user not found")
		return
	}
	if err != nil {
		respondError(c, http.StatusInternalServerError, "internal", "failed to update user")
		return
	}
	c.JSON(http.StatusOK, toUserDTO(user))
}
