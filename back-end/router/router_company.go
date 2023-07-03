package router

import (
	"airline/dao"
	"airline/global"
	"airline/model"
	res "airline/response"
	"github.com/gin-gonic/gin"
)

// 航空公司查询自己已经发布的航班
func QueryExistFlights(c *gin.Context) {
	var flightInfo model.FlightModel
	var flights []model.FlightModel
	if err := c.ShouldBindJSON(&flightInfo); err != nil { //绑定前端参数
		global.Log.Error(err)
		res.FailWithCode(res.ArgumentError, c)
		return
	}
	if err := dao.GetCompanyFlightsInfo(flightInfo.Address, &flights); err != nil {
		global.Log.Error(err)
		res.FailWithCode(res.SettingsError, c)
		return
	}
	res.OkWithData(flights, c) //返回的数据是一个列表
}
