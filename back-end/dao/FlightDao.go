package dao

import (
	"airline/global"
	"airline/model"
	"fmt"
	"time"
)

// 根据出发地 目的地 出发时间查询航班信息
func GetFlightsInfo(flightInfo *model.FlightModel, flights *[]model.FlightModel) (err error) {
	var preDayTimes = flightInfo.DepartureTime - time.Hour.Milliseconds()*24
	return global.DB.Table("flights").Exec(fmt.Sprintf("select * from flights where `from` = \"%s\" and `to`= \"%s\" and departure_time  between %d and %d ", flightInfo.From, flightInfo.To, int64(preDayTimes), flightInfo.DepartureTime)).Find(&flights).Error
}

// 根据航班号查询航班信息
func GetFlightInfoByFightNUmber(flightNumber string, flightInfo *model.FlightModel) error {
	return global.DB.Table("flights").Select("*").Where("flight_number=?", flightNumber).Find(flightInfo).Error
}
