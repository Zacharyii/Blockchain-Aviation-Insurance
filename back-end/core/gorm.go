package core

import (
	"airline/global"
	"airline/model"
	"fmt"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitGorm() *gorm.DB { //返回一个db连接
	if global.Config.Mysql.Host == "" {
		global.Log.Warnln("未配置mysql，取消gorm连接")
		return nil
	}
	dsn := global.Config.Mysql.Dsn()
	var mysqlLogger logger.Interface
	var err error
	global.DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: mysqlLogger,
	})
	createTables(global.DB)
	if err != nil {
		global.Log.Fatalf(fmt.Sprintf("[%s] mysql连接失败", dsn))
	}
	sqlDB, _ := global.DB.DB()
	sqlDB.SetMaxIdleConns(10)               //最大空闲连接数
	sqlDB.SetMaxOpenConns(100)              //最大可容纳
	sqlDB.SetConnMaxLifetime(time.Hour * 4) //连接最大可用时间，不能超过mysql的wait_timeout

	fmt.Printf("%v datebase connect success\n", time.Now().Format("2006/01/02 15:04:05"))

	return global.DB

}

func createTables(db *gorm.DB) error {
	if db.Migrator().HasTable(&model.FlightModel{}) { // YourModel改为实际的模型名称
		return nil // 表已存在，直接返回
	}

	if err := db.Table("flights").AutoMigrate(&model.FlightModel{}); err != nil { // YourModel改为实际的模型名称
		return err
	}
	if db.Migrator().HasTable(&model.UserOrderModel{}) { // YourModel改为实际的模型名称
		return nil // 表已存在，直接返回
	}

	if err := db.Table("user_order_info").AutoMigrate(&model.UserOrderModel{}); err != nil { // YourModel改为实际的模型名称
		return err
	}
	if db.Migrator().HasTable(&model.UserOrderDetail{}) { // YourModel改为实际的模型名称
		return nil // 表已存在，直接返回
	}

	if err := db.Table("user_order_details").AutoMigrate(&model.UserOrderDetail{}); err != nil { // YourModel改为实际的模型名称
		return err
	}

	return nil
}
