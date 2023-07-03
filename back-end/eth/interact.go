package eth

import (
	"airline/dao"
	"airline/global"
	"airline/model"
	"airline/utils"
	"bytes"
	"context"
	"fmt"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"math/big"
	"time"
)

func Listen() {

	//连接以太坊节点客户端
	client, err := ethclient.Dial(global.Config.Contract.NetDial)
	if err != nil {
		global.Log.Fatalf("连接以太坊节点客户端失败！%v\n", err)
		return
	}
	//判断连接是否成功
	blockNumber, err := client.BlockNumber(context.Background())
	if err != nil {
		global.Log.Fatalf("监听订阅失败！请检查节点是否支持消息监听订阅 %v\n", err)
		return
	}

	//定义要监听的合约地址
	contractAddress1 := common.HexToAddress(global.Config.Contract.Address1) //airline合约地址
	contractAddress2 := common.HexToAddress(global.Config.Contract.Address2) //flight合约地址
	contractAddress3 := common.HexToAddress(global.Config.Contract.Address3) //insurance合约地址

	//定义要监听的事件
	TicketIssued := Topics("TicketIssued(bytes,string,uint256,string,string,uint32,uint32,uint128)") //发布航班事件
	TicketPurchased := Topics("TicketPurchased(bytes,uint256,string,uint24)")                        //买票
	TicketRefund := Topics("TicketRefund(bytes,uint256,string,uint24)")                              //退票
	InsurancePurchased := Topics("InsurancePurchased(bytes,uint256,string,uint8)")                   //买保险
	InsuranceRefund := Topics("InsuranceRefund(bytes,uint256,string,uint8)")                         //退保险

	//构造查询条件
	query := ethereum.FilterQuery{
		Addresses: []common.Address{contractAddress1, contractAddress2, contractAddress3}, //查询的合约地址
		FromBlock: big.NewInt(int64(blockNumber - 100)),                                   //从近50个区块开始监听
		Topics: [][]common.Hash{{
			TicketIssued,
			TicketPurchased,
			TicketRefund,
			InsurancePurchased,
			InsuranceRefund,
		}}, //查询的主题
	}

	//解析abi文件
	airlineAbi := ParseABI("airline.json")
	flightABI := ParseABI("flight.json")
	insuranceAbi := ParseABI("insurance.json")

	//启动监听器
	ctx := context.Background()
	logsCh := make(chan types.Log, 1024) //定义一个管道，用流模式实时接收链上事件的数据
	sub, err := client.SubscribeFilterLogs(ctx, query, logsCh)
	if err != nil {
		global.Log.Fatalf("启动监听器失败！%v\n", err)
		return
	}
	defer sub.Unsubscribe()

	//启动循环监听
	for {
		fmt.Println("Listening!")
		select {
		case err := <-sub.Err():
			global.Log.Errorf("监听错误%v\n", err)
		case <-time.After(time.Minute * 120): //120分钟没有接收到数据自动断开监听
			global.Log.Fatal("Timeout, exit")
			return
		default:
			value := <-logsCh //把监听到的数据读出来
			switch {
			case bytes.Equal(value.Topics[0].Bytes(), ArrToSlice(TicketIssued)): //发布新航班事件
				fmt.Println("发布新航班")
				fmt.Println(ParseEventLog("TicketIssued", value.Data, airlineAbi))
				FlightInfo := ParseEventLog("TicketIssued", value.Data, airlineAbi) //获得解码之后的数据
				newFlight := ParseFlightData(FlightInfo)
				ErrHandle(dao.PostNewFlight(&newFlight)) //保存新的航班信息

			case bytes.Equal(value.Topics[0].Bytes(), ArrToSlice(TicketPurchased)): //购买机票事件
				fmt.Println("买机票")
				fmt.Println(ParseEventLog("TicketPurchased", value.Data, flightABI))
				OrderInfo := ParseEventLog("TicketPurchased", value.Data, flightABI)
				newOrder := ParseTicketData(OrderInfo)

				flightDetail := model.FlightModel{} //保存之后，根据航班号，查询出对应的航班信息
				ErrHandle(dao.GetFlightInfoByFightNUmber(newOrder.FlightNumber, &flightDetail))
				OrderDetail := model.UserOrderDetail{ //之后把他们一起存入详细订单表中
					UserAddr:             newOrder.UserAddr,
					FlightNumber:         newOrder.FlightNumber,
					CompanyName:          flightDetail.CompanyName,
					InsuranceType:        newOrder.InsuranceType,
					DepartureTime:        flightDetail.DepartureTime,
					ScheduledArrivalTime: flightDetail.ScheduledArrivalTime,
					FromLoc:              flightDetail.From,
					ToLoc:                flightDetail.To,
					Price:                flightDetail.Price,
					Seat:                 newOrder.Seat,
					IdCard:               newOrder.IdCard,
				}
				ErrHandle(dao.PostNewOrder(&newOrder)) //保存新的机票信息
				ErrHandle(dao.PostOrderDetail(&OrderDetail))

			case bytes.Equal(value.Topics[0].Bytes(), ArrToSlice(TicketRefund)): //退机票事件
				fmt.Println("退机票")
				fmt.Println(ParseEventLog("TicketRefund", value.Data, flightABI))
				OrderInfo := ParseEventLog("TicketRefund", value.Data, flightABI)
				newOrder := ParseTicketData(OrderInfo)
				ErrHandle(dao.RefundOrder(&newOrder))       //update事件
				ErrHandle(dao.RefundOrderDetail(&newOrder)) //update事件

			case bytes.Equal(value.Topics[0].Bytes(), ArrToSlice(InsurancePurchased)): //购买保险事件
				fmt.Println("买保险")
				fmt.Println(ParseEventLog("InsurancePurchased", value.Data, insuranceAbi))
				OrderInfo := ParseEventLog("InsurancePurchased", value.Data, insuranceAbi)
				newOrder := ParseInsuranceData(OrderInfo)
				ErrHandle(dao.UpdateOrderDetailInfo(&newOrder)) //update事件
				ErrHandle(dao.UpdateOrderInfo(&newOrder))

			case bytes.Equal(value.Topics[0].Bytes(), ArrToSlice(InsuranceRefund)): //退保险事件
				fmt.Println("退保险")
				fmt.Println(ParseEventLog("InsuranceRefund", value.Data, insuranceAbi))
				OrderInfo := ParseEventLog("InsuranceRefund", value.Data, insuranceAbi)
				newOrder := ParseInsuranceData(OrderInfo)
				ErrHandle(dao.UpdateOrderInfo(&newOrder))       //update事件
				ErrHandle(dao.UpdateOrderDetailInfo(&newOrder)) //update事件
			default:
				panic(fmt.Sprintf("invalid type: %v", value))
			}
		}
	}
}

// 解码发布航班事件
func ParseFlightData(FlightInfo map[string]interface{}) model.FlightModel {
	NewFlight := model.FlightModel{} //把数据保存到结构体中
	addr := RecoverByteSlice(FlightInfo["adr"])
	NewFlight.Address = "0x" + fmt.Sprintf("%x", addr) //公司地址
	//NewFlight.Address = utils.Md5WithKey(NewFlight.Address, global.Config.Encrypt.Xid) //把公司地址进行加密
	NewFlight.CompanyName = FlightInfo["airlineName"].(string)                          //公司名称
	NewFlight.FlightNumber = (FlightInfo["flightNumber"].(*big.Int)).String()           //航班号
	NewFlight.From = (FlightInfo["from"]).(string)                                      //始发地
	NewFlight.To = (FlightInfo["to"]).(string)                                          //目的地
	NewFlight.DepartureTime = int64(FlightInfo["departureTime"].(uint32))               //起飞时间
	NewFlight.ScheduledArrivalTime = int64(FlightInfo["scheduledArrivalTime"].(uint32)) //到达时间
	NewFlight.Price = (FlightInfo["ticketPrice"].(*big.Int)).String()                   //价格

	return NewFlight
}

// 解码机票事件[买票退票]
func ParseTicketData(OrderInfo map[string]interface{}) model.UserOrderModel {
	NewOrder := model.UserOrderModel{}
	addr := OrderInfo["addr"].([]byte)
	NewOrder.UserAddr = "0x" + fmt.Sprintf("%x", addr) //用户地址
	//NewOrder.UserAddr = utils.Md5WithKey(NewOrder.IdCard, global.Config.Encrypt.Xid) //把用户地址进行加密
	NewOrder.FlightNumber = OrderInfo["flightNumber"].(*big.Int).String() //航班号
	NewOrder.IdCard = OrderInfo["customer"].(string)                      //身份证号
	//NewOrder.IdCard = utils.Md5WithKey(NewOrder.IdCard, global.Config.Encrypt.Md5) //把身份证号进行一个加密
	NewOrder.Seat = OrderInfo["seat"].(*big.Int).String()
	NewOrder.OrderId = utils.OrderIdGenerate() //随机生成订单号
	NewOrder.InsuranceType = 0                 //默认保险为0

	return NewOrder
}

// 解码保险事件[买保险退保险]
func ParseInsuranceData(OrderInfo map[string]interface{}) model.UserOrderModel {
	NewOrder := model.UserOrderModel{}
	addr := OrderInfo["addr"].([]byte)
	NewOrder.UserAddr = "0x" + fmt.Sprintf("%x", addr) //用户地址
	//NewOrder.UserAddr = utils.Md5WithKey(NewOrder.IdCard, global.Config.Encrypt.Xid) //把用户地址进行加密
	NewOrder.FlightNumber = (OrderInfo["flightNumber"].(*big.Int)).String() //航班号
	NewOrder.IdCard = (OrderInfo["customer"]).(string)                      //身份证号
	//NewOrder.IdCard = utils.Md5WithKey(NewOrder.IdCard, global.Config.Encrypt.Md5) //把身份证号进行一个加密
	NewOrder.OrderId = utils.OrderIdGenerate()                          //随机生成订单号
	NewOrder.InsuranceType = int64(OrderInfo["insuranceClass"].(uint8)) //默认保险为0

	return NewOrder
}
