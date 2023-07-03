package model

type FlightModel struct { //航班表
	Address              string `json:"account" gorm:"address" form:"account"` //航空公司地址，作为主键
	CompanyName          string `json:"company_name" gorm:"company_name"`
	FlightNumber         string `json:"flight_number" gorm:"flight_number"`                   //航班号
	Price                string `json:"price" gorm:"price"`                                   //价格
	DepartureTime        int64  `json:"departTime" gorm:"departure_time" form:"departTime"`   //出发时间
	ScheduledArrivalTime int64  `json:"scheduled_arrival_time" gorm:"scheduled_arrival_time"` //到达时间
	From                 string `json:"departPlace" gorm:"from" form:"departPlace"`           //起始地
	To                   string `json:"arrivePlace" gorm:"to" form:"arrivePlace"`             //目的地
}

type UserOrderModel struct { //用户信息表
	OrderId       string `json:"order_id" gorm:"order_id"`                                   //订单号，作为主键
	UserAddr      string `json:"account" gorm:"user_addr" form:"account"`                    //用户地址
	IdCard        string `json:"id_card" gorm:"id_card"`                                     //身份证
	FlightNumber  string `json:"flight_number" gorm:"flight_number" form:"flight_number"`    // 修改：将 flight_number 改为外键
	Seat          string `json:"seat" gorm:"seat" form:"seat"`                               //座位号
	InsuranceType int64  `json:"insurance_type" gorm:"insurance_type" form:"insurance_type"` //保险类型
}

type UserOrderDetail struct { //用户订单详情表
	UserAddr             string `json:"account" gorm:"user_addr" form:"account"`                 //用户地址
	FlightNumber         string `json:"flight_number" gorm:"flight_number" form:"flight_number"` // 修改：将 flight_number 改为外键
	CompanyName          string `json:"company_name" gorm:"company_name"`
	InsuranceType        int64  `json:"insurance_type" gorm:"insurance_type" form:"insurance_type"` //保险类型
	DepartureTime        int64  `json:"departTime" gorm:"departure_time" form:"departTime"`         //出发时间
	ScheduledArrivalTime int64  `json:"scheduled_arrival_time" gorm:"scheduled_arrival_time"`       //到达时间
	FromLoc              string `json:"departPlace" gorm:"from_loc" form:"departPlace"`             //起始地
	ToLoc                string `json:"arrivePlace" gorm:"to_loc" form:"arrivePlace"`               //目的地
	Price                string `json:"price" gorm:"price"`                                         //价格
	IdCard               string `json:"id_card" gorm:"id_card"`                                     //身份证
	Seat                 string `json:"seat" gorm:"seat" form:"seat"`                               //座位号
}
