package service

import "errors"

var (
	// ErrEmailTaken is returned when registering with an existing email.
	ErrEmailTaken = errors.New("email already registered")
	// ErrInvalidCredentials is returned on a failed login.
	ErrInvalidCredentials = errors.New("invalid email or password")
	// ErrUserNotFound is returned when a user lookup fails.
	ErrUserNotFound = errors.New("user not found")
	// ErrForbidden is returned when an action is not permitted.
	ErrForbidden = errors.New("forbidden")
)
