package router

import (
	"airline/middleware"
	"github.com/gin-gonic/gin"
)

func RoutersInit(r *gin.Engine) {

	userGroup := r.Group("/")
	userGroup.Use(middleware.Cors()) //使用中间件进行跨域处理

	r.POST("UserSelectFlight", QueryFlightsByCons)     // 输入出发地、目的地、出发时间查询机票
	r.POST("UserSelectTransactions", QueryOwnerOrders) // 查看自己购买的机票和保险（可退票）
	r.POST("CompanySelectFlight", QueryExistFlights)
}
