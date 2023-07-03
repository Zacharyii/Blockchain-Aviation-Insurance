package main

import (
	"airline/core"
	"airline/eth"
	"airline/middleware"
	"airline/router"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	gin.SetMode(gin.ReleaseMode) //不显示gin框架的初始化配置信息
	r.Use(middleware.Cors())     //使用中间件进行跨域处理
	router.RoutersInit(r)        //初始化路由
	core.InitConf()              //初始化配置文件
	core.InitGorm()              //初始化gorm框架
	core.InitLogger()            //初始化logger框架
	go eth.Listen()              //启动协程监听链上合约事件
	r.Run(":8080")               //启动后端服务器
}
