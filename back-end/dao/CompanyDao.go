package dao

import (
	"airline/global"
	"airline/model"
)

// 根据肮空公司地址去查询自己发布的航班
func GetCompanyFlightsInfo(companyAddr string, flights *[]model.FlightModel) (err error) {
	return global.DB.Table("flights").Select("*").Where("address=?", companyAddr).Find(flights).Error
}

// 发布新航班
func PostNewFlight(flight *model.FlightModel) (err error) {
	return global.DB.Table("flights").Create(flight).Error
}
