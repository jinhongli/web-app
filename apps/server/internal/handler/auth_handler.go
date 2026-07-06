package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/web-app/server/internal/auth"
	"github.com/web-app/server/internal/service"
)

// AuthHandler exposes the auth endpoints.
type AuthHandler struct {
	auth *service.AuthService
}

// NewAuthHandler builds an AuthHandler.
func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{auth: authService}
}

type registerRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Name     string `json:"name" binding:"required,min=1,max=64"`
	Password string `json:"password" binding:"required,min=8,max=128"`
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,max=128"`
}

type refreshRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

// Register handles POST /api/auth/register.
func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "invalid_request", err.Error())
		return
	}

	result, err := h.auth.Register(c.Request.Context(), req.Email, req.Name, req.Password)
	if errors.Is(err, service.ErrEmailTaken) {
		respondError(c, http.StatusConflict, "email_taken", "email already registered")
		return
	}
	if err != nil {
		respondError(c, http.StatusInternalServerError, "internal", "failed to register")
		return
	}

	c.JSON(http.StatusCreated, authResultDTO{
		User:   toUserDTO(result.User),
		Tokens: tokensDTO(result.Tokens),
	})
}

// Login handles POST /api/auth/login.
func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "invalid_request", err.Error())
		return
	}

	result, err := h.auth.Login(c.Request.Context(), req.Email, req.Password)
	if errors.Is(err, service.ErrInvalidCredentials) {
		respondError(c, http.StatusUnauthorized, "invalid_credentials", "invalid email or password")
		return
	}
	if err != nil {
		respondError(c, http.StatusInternalServerError, "internal", "failed to login")
		return
	}

	c.JSON(http.StatusOK, authResultDTO{
		User:   toUserDTO(result.User),
		Tokens: tokensDTO(result.Tokens),
	})
}

// Refresh handles POST /api/auth/refresh.
func (h *AuthHandler) Refresh(c *gin.Context) {
	var req refreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "invalid_request", err.Error())
		return
	}

	tokens, err := h.auth.Refresh(c.Request.Context(), req.RefreshToken)
	if errors.Is(err, auth.ErrInvalidToken) {
		respondError(c, http.StatusUnauthorized, "invalid_token", "invalid refresh token")
		return
	}
	if err != nil {
		respondError(c, http.StatusInternalServerError, "internal", "failed to refresh")
		return
	}

	c.JSON(http.StatusOK, tokensDTO(tokens))
}
