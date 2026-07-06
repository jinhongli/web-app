package database

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/web-app/server/internal/model"
)

// Open connects to PostgreSQL and runs migrations.
func Open(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	if err := migrate(db); err != nil {
		return nil, err
	}
	return db, nil
}

func migrate(db *gorm.DB) error {
	return db.AutoMigrate(&model.User{})
}
