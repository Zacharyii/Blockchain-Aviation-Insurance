package global

import (
	"airline/config"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

var (
	Config   *config.Config //这里加指针很有意义
	DB       *gorm.DB
	Log      *logrus.Logger
	UserAddr string
)
