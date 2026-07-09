package config

import (
	"os"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all runtime configuration loaded from the environment.
type Config struct {
	Port            string
	DatabaseDSN     string
	JWTSecret       string
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
	Env             string
}

// Load reads configuration from a .env file (if present) and the environment.
func Load() *Config {
	_ = godotenv.Load()

	return &Config{
		Port:            getEnv("PORT", "8080"),
		DatabaseDSN:     getEnv("DATABASE_DSN", "host=localhost user=postgres password=postgres dbname=webapp port=5432 sslmode=disable"),
		JWTSecret:       getEnv("JWT_SECRET", "dev-insecure-secret-change-me"),
		AccessTokenTTL:  getDuration("ACCESS_TOKEN_TTL", 24*time.Hour),
		RefreshTokenTTL: getDuration("REFRESH_TOKEN_TTL", 7*24*time.Hour),
		Env:             getEnv("APP_ENV", "development"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	return fallback
}

func getDuration(key string, fallback time.Duration) time.Duration {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		if parsed, err := time.ParseDuration(value); err == nil {
			return parsed
		}
	}
	return fallback
}
