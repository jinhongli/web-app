package service

import (
	"context"
	"errors"

	"github.com/web-app/server/internal/model"
	"github.com/web-app/server/internal/repository"
)

// UserService handles user queries and mutations.
type UserService struct {
	users *repository.UserRepository
}

// NewUserService builds a UserService.
func NewUserService(users *repository.UserRepository) *UserService {
	return &UserService{users: users}
}

// GetByID returns a single user.
func (s *UserService) GetByID(ctx context.Context, id string) (*model.User, error) {
	user, err := s.users.FindByID(ctx, id)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrUserNotFound
	}
	return user, err
}

// Page is a paginated slice of users.
type Page struct {
	Items    []model.User
	Total    int64
	Page     int
	PageSize int
}

// List returns a page of users.
func (s *UserService) List(ctx context.Context, page, pageSize int) (*Page, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize
	items, total, err := s.users.List(ctx, offset, pageSize)
	if err != nil {
		return nil, err
	}
	return &Page{Items: items, Total: total, Page: page, PageSize: pageSize}, nil
}

// UpdateInput carries the mutable fields of a user.
type UpdateInput struct {
	Name *string
	Role *model.Role
}

// Update mutates a user's name and/or role.
func (s *UserService) Update(ctx context.Context, id string, input UpdateInput) (*model.User, error) {
	user, err := s.users.FindByID(ctx, id)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}
	if input.Name != nil {
		user.Name = *input.Name
	}
	if input.Role != nil {
		user.Role = *input.Role
	}
	if err := s.users.Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}
