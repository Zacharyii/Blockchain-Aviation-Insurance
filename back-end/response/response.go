package res

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type Response struct { //返回信息结构体
	Code int    `json:"code"` //状态码
	Data any    `json:"data"` //数据
	Msg  string `json:"msg"`  //备注
}

type ListResponse[T any] struct { //返回列表
	Count int64 `json:"count"`
	List  T     `json:"list"` //T代表泛型
}

const ( //反正状态码常量
	Success = 0
	Error   = 1
)

func Result(code int, data any, msg string, c *gin.Context) { //返回
	c.JSON(http.StatusOK, Response{
		Code: code,
		Data: data,
		Msg:  msg,
	})
}

func Ok(data any, msg string, c *gin.Context) { //响应成功，返回数据和备注，c
	Result(Success, data, msg, c)
}
func OkWithData(data any, c *gin.Context) { //响应成功，返回数据，备注“成功”
	Result(Success, data, "成功", c)
}

func OkWithList(list any, count int64, c *gin.Context) { //返回列表，例如图片列表
	OkWithData(ListResponse[any]{
		List:  list,
		Count: count,
	}, c)
}

func OkWithMessage(msg string, c *gin.Context) { //响应成功，返回备注
	Result(Success, map[string]any{}, msg, c)
}
func OkWith(c *gin.Context) { //响应成功，返回备注“成功”
	Result(Success, map[string]any{}, "成功", c)
}

func Fail(data any, msg string, c *gin.Context) { //响应失败，返回数据和备注，c
	Result(Error, data, msg, c)
}
func FailWithMessage(msg string, c *gin.Context) { //响应失败，返回备注和c
	Result(Error, map[string]any{}, msg, c)
}

//func FailWithError(err error, obj any, c *gin.Context) {
//	msg := utils.GetValidMsg(err, obj)
//	FailWithMessage(msg, c)
//}

func FailWithCode(code ErrorCode, c *gin.Context) { //响应失败，返回备注“未知错误”
	msg, ok := ErrorMap[code]
	if ok {
		Result(int(code), map[string]any{}, msg, c)
		return
	}
	Result(Error, map[string]any{}, "未知错误", c)
}
