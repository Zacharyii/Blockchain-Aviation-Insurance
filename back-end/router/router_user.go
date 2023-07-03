package router

import (
	"airline/dao"
	"airline/global"
	"airline/model"
	res "airline/response"
	"github.com/gin-gonic/gin"
)

// 输入出发地、目的地、出发时间查询机票
func QueryFlightsByCons(c *gin.Context) {
	var flightInfo model.FlightModel
	if err := c.ShouldBindJSON(&flightInfo); err != nil { //绑定前端参数
		global.Log.Error(err)
		res.FailWithCode(res.ArgumentError, c)
		return
	}
	var flights []model.FlightModel
	if err := dao.GetFlightsInfo(&flightInfo, &flights); err != nil {
		global.Log.Error(err)
		res.FailWithCode(res.SettingsError, c)
		return
	}
	res.OkWithData(flights, c) //返回的数据是一个列表
}

// 查看自己购买的机票和保险（可退票）
func QueryOwnerOrders(c *gin.Context) {
	var OrdersInfo model.UserOrderModel
	if err := c.ShouldBindJSON(&OrdersInfo); err != nil { //绑定前端参数
		global.Log.Error(err)
		res.FailWithCode(res.ArgumentError, c)
		return
	}
	var Orders []model.UserOrderDetail
	if err := dao.GetOrdersDetail(OrdersInfo.UserAddr, &Orders); err != nil {
		global.Log.Error(err)
		res.FailWithCode(res.SettingsError, c)
		return
	}
	res.OkWithData(Orders, c) //返回的数据是一个列表

}
