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
