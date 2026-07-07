package main

import (
	"log/slog"
	"os"

	"github.com/web-app/server/internal/auth"
	"github.com/web-app/server/internal/config"
	"github.com/web-app/server/internal/database"
	"github.com/web-app/server/internal/repository"
	"github.com/web-app/server/internal/router"
	"github.com/web-app/server/internal/service"
	"github.com/web-app/server/pkg/logger"
)

func main() {
	cfg := config.Load()
	log := logger.New(cfg.Env)

	db, err := database.Open(cfg.DatabaseDSN)
	if err != nil {
		log.Error("failed to connect to database", slog.Any("error", err))
		os.Exit(1)
	}

	tokenMgr := auth.NewManager(cfg.JWTSecret, cfg.AccessTokenTTL, cfg.RefreshTokenTTL)
	userRepo := repository.NewUserRepository(db)
	logRepo := repository.NewRequestLogRepository(db)
	authService := service.NewAuthService(userRepo, tokenMgr)
	userService := service.NewUserService(userRepo)
	logService := service.NewRequestLogService(logRepo)

	// Swap in the persisting logger now that the sink is available.
	log = logger.NewWithSink(cfg.Env, logService)

	engine := router.New(router.Deps{
		Logger:            log,
		TokenMgr:          tokenMgr,
		AuthService:       authService,
		UserService:       userService,
		RequestLogService: logService,
	})

	addr := ":" + cfg.Port
	log.Info("server starting", slog.String("addr", addr), slog.String("env", cfg.Env))
	if err := engine.Run(addr); err != nil {
		log.Error("server stopped", slog.Any("error", err))
		os.Exit(1)
	}
}
