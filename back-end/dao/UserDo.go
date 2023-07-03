package dao

import (
	"airline/global"
	"airline/model"
	"fmt"
)

// 更新用户总订单的保险信息
func UpdateOrderInfo(order *model.UserOrderModel) (err error) {
	return global.DB.Table("user_order_info").Where("id_card=? and flight_number=?", order.IdCard, order.FlightNumber).
		UpdateColumn("insurance_type", order.InsuranceType).Error
}

// 更新订单详情表中的保险信息
func UpdateOrderDetailInfo(order *model.UserOrderModel) (err error) {
	return global.DB.Table("user_order_details").Where("id_card=? and flight_number=?", order.IdCard, order.FlightNumber).
		UpdateColumn("insurance_type", order.InsuranceType).Error
}

// 保存新的机票信息
func PostNewOrder(order *model.UserOrderModel) (err error) {
	fmt.Println(order)
	return global.DB.Table("user_order_info").Create(order).Error
}

// 保存详细订单信息
func PostOrderDetail(orderDetail *model.UserOrderDetail) error {
	return global.DB.Table("user_order_details").Create(orderDetail).Error
}

// 删除指定机票信息
func RefundOrder(order *model.UserOrderModel) (err error) {
	return global.DB.Table("user_order_info").Where("id_card=? and flight_number=?", order.IdCard, order.FlightNumber).
		Delete(order).Error
}

// 删除指定详细订单信息
func RefundOrderDetail(order *model.UserOrderModel) (err error) {
	return global.DB.Table("user_order_details").Where("id_card=? and flight_number=?", order.IdCard, order.FlightNumber).
		Delete(order).Error
}

// 获取详细订单信息
func GetOrdersDetail(addr string, ordersDetail *[]model.UserOrderDetail) error {
	return global.DB.Table("user_order_details").Where("user_addr=?", addr).Find(ordersDetail).Error
}
