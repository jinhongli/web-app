package service

import (
	"context"
	"errors"

	"github.com/google/uuid"

	"github.com/web-app/server/internal/auth"
	"github.com/web-app/server/internal/model"
	"github.com/web-app/server/internal/repository"
)

// AuthService handles registration, login and token refresh.
type AuthService struct {
	users  *repository.UserRepository
	tokens *auth.Manager
}

// NewAuthService builds an AuthService.
func NewAuthService(users *repository.UserRepository, tokens *auth.Manager) *AuthService {
	return &AuthService{users: users, tokens: tokens}
}

// AuthResult bundles a user with a freshly issued token pair.
type AuthResult struct {
	User   *model.User
	Tokens auth.Tokens
}

// Register creates a new account.
func (s *AuthService) Register(ctx context.Context, email, name, password string) (*AuthResult, error) {
	if _, err := s.users.FindByEmail(ctx, email); err == nil {
		return nil, ErrEmailTaken
	} else if !errors.Is(err, repository.ErrNotFound) {
		return nil, err
	}

	hash, err := auth.HashPassword(password)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		ID:           uuid.NewString(),
		Email:        email,
		Name:         name,
		PasswordHash: hash,
		Role:         model.RoleUser,
	}
	if err := s.users.Create(ctx, user); err != nil {
		return nil, err
	}

	return s.issue(user)
}

// Login authenticates a user with credentials.
func (s *AuthService) Login(ctx context.Context, email, password string) (*AuthResult, error) {
	user, err := s.users.FindByEmail(ctx, email)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrInvalidCredentials
	}
	if err != nil {
		return nil, err
	}
	if !auth.CheckPassword(user.PasswordHash, password) {
		return nil, ErrInvalidCredentials
	}
	return s.issue(user)
}

// Refresh exchanges a refresh token for a new token pair.
func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (auth.Tokens, error) {
	claims, err := s.tokens.Parse(refreshToken)
	if err != nil || claims.Type != auth.RefreshToken {
		return auth.Tokens{}, auth.ErrInvalidToken
	}
	user, err := s.users.FindByID(ctx, claims.UserID)
	if errors.Is(err, repository.ErrNotFound) {
		return auth.Tokens{}, auth.ErrInvalidToken
	}
	if err != nil {
		return auth.Tokens{}, err
	}
	return s.tokens.Generate(user)
}

func (s *AuthService) issue(user *model.User) (*AuthResult, error) {
	tokens, err := s.tokens.Generate(user)
	if err != nil {
		return nil, err
	}
	return &AuthResult{User: user, Tokens: tokens}, nil
}
