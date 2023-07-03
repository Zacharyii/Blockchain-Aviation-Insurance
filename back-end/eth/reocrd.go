package eth

//default:
//value := <-logsCh //把监听到的数据读出来
//switch {
//case bytes.Equal(value.Topics[0].Bytes(), ArrToSlice(TicketIssued)): //发布新航班事件
//fmt.Println(ParseEventLog("TicketIssued", value.Data, airlineAbi))
//FlightInfo := ParseEventLog("TicketIssued", value.Data, airlineAbi) //获得解码之后的数据
//
//newFlight := model.FlightModel{}                                    //把数据保存到结构体中
////addr := FlightInfo["adr"].(byte)
////newFlight.Address = fmt.Sprintf("%x", addr)
//newFlight.Address = "0x00EdCc04a49f162e09FB35538D4157318947A008"                    //公司地址
//newFlight.CompanyName = FlightInfo["airlineName"].(string)                          //公司名称
//newFlight.FlightNumber = FlightInfo["flightNumber"].(*big.Int).String()             //航班号
//newFlight.From = FlightInfo["from"].(string)                                        //始发地
//newFlight.To = FlightInfo["to"].(string)                                            //目的地
//newFlight.DepartureTime = int64(FlightInfo["departureTime"].(uint32))               //起飞时间
//newFlight.ScheduledArrivalTime = int64(FlightInfo["scheduledArrivalTime"].(uint32)) //到达时间
//newFlight.Price = FlightInfo["ticketPrice"].(*big.Int).String()                     //价格
//
//
//dao.PostNewFlight(&newFlight)                                                       //保存新的航班信息
//
//case bytes.Equal(value.Topics[0].Bytes(), ArrToSlice(TicketPurchased)): //购买机票事件
//fmt.Println(value.Topics[0].Bytes())
//fmt.Println(ParseEventLog("TicketPurchased", value.Data, flightABI))
//
//OrderInfo := ParseEventLog("TicketPurchased", value.Data, flightABI)
//
//newOrder := model.UserOrderModel{}
//newOrder.UserAddr = "0x7FcA72991a601c7D66d56f68F9a01553cAAe5622" //= OrderInfo["addr"].(byte)
////newOrder.UserAddr = fmt.Sprintf("%x", addr)
//newOrder.OrderId = utils.OrderIdGenerate()
//newOrder.IdCard = OrderInfo["customer"].(string)
//newOrder.FlightNumber = OrderInfo["flightNumber"].(*big.Int).String()
//newOrder.Seat = OrderInfo["seat"].(*big.Int).String()
//newOrder.InsuranceType = 0 //默认保险为0
//
////TicketPurchased := Topics("TicketPurchased(bytes,uint256,string,uint24)")
////addr  customer  flightNUmber  seat
//dao.PostNewOrder(&newOrder) //保存新的机票信息
//
////保存之后，根据航班号，查询出对应的航班信息
//flightDetail := model.FlightModel{}
//dao.GetFlightInfoByFightNUmber(newOrder.FlightNumber, &flightDetail)
//
////之后把他们一起存入数据库新的表中
//OrderDetail := model.UserOrderDetail{
//UserAddr:             newOrder.UserAddr,
//FlightNumber:         newOrder.FlightNumber,
//CompanyName:          flightDetail.CompanyName,
//InsuranceType:        newOrder.InsuranceType,
//DepartureTime:        flightDetail.DepartureTime,
//ScheduledArrivalTime: flightDetail.ScheduledArrivalTime,
//FromLoc:              flightDetail.From,
//ToLoc:                flightDetail.To,
//Price:                flightDetail.Price,
//}
//
//dao.PostOrderDetail(&OrderDetail)
//
//case bytes.Equal(value.Topics[0].Bytes(), ArrToSlice(TicketRefund)): //退机票事件
//fmt.Println(ParseEventLog("TicketRefund", value.Data, flightABI))
////update事件
//OrderInfo := ParseEventLog("TicketRefund", value.Data, flightABI)
//newOrder := model.UserOrderModel{}
//addr := OrderInfo["addr"].(byte)
//newOrder.UserAddr = fmt.Sprintf("%x", addr)
//newOrder.IdCard = OrderInfo["customer"].(string)
//newOrder.FlightNumber = OrderInfo["flightNumber"].(*big.Int).String()
//newOrder.Seat = OrderInfo["seat"].(*big.Int).String()
//
//dao.RefundOrder(&newOrder)
//
//case bytes.Equal(value.Topics[0].Bytes(), ArrToSlice(InsurancePurchased)): //购买保险事件
//fmt.Println("买保险！")
//fmt.Println(ParseEventLog("InsurancePurchased", value.Data, insuranceAbi))
////update事件
//OrderInfo := ParseEventLog("InsurancePurchased", value.Data, insuranceAbi)
//newOrder := model.UserOrderModel{}
//
//newOrder.UserAddr = "0x7FcA72991a601c7D66d56f68F9a01553cAAe5622"
////addr := OrderInfo["addr"].(byte)  //地址
////newOrder.UserAddr = fmt.Sprintf("%x", add
//newOrder.FlightNumber = OrderInfo["flightNumber"].(*big.Int).String() //航班号
//
//newOrder.IdCard = OrderInfo["customer"].(string) //身份证
//
//newOrder.InsuranceType = int64(int32(OrderInfo["insuranceClass"].(uint8))) //保险类型
//
////InsurancePurchased(bytes,uint256,string,uint8)
//
//dao.UpdateOrderInfo(&newOrder)
//
//case bytes.Equal(value.Topics[0].Bytes(), ArrToSlice(InsuranceRefund)): //退保险事件
//fmt.Println(ParseEventLog("InsuranceRefund", value.Data, insuranceAbi))
////update事件
//
//OrderInfo := ParseEventLog("InsuranceRefund", value.Data, flightABI)
//newOrder := model.UserOrderModel{}
//
//addr := OrderInfo["addr"].(byte)
//newOrder.UserAddr = fmt.Sprintf("%x", addr)
//
//newOrder.IdCard = OrderInfo["customer"].(string)
//newOrder.FlightNumber = OrderInfo["flightNumber"].(*big.Int).String()
//newOrder.Seat = OrderInfo["seat"].(*big.Int).String()
//
//dao.UpdateOrderInfo(&newOrder)
//
//default:
//panic(fmt.Sprintf("invalid type: %v", value))
//}
