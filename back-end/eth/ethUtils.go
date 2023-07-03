package eth

import (
	"airline/global"
	"fmt"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"golang.org/x/crypto/sha3"
	"io/ioutil"
	"log"
	"strings"
)

// 转换成String
func RecoverString(v interface{}) string {
	s, ok := v.(string)
	if !ok {
		global.Log.Error(ok)
		return ""
	}
	return s
}

// 转换成Int64
func RecoverInt64(v interface{}) int64 {
	i, ok := v.(int64)
	if !ok {
		global.Log.Error(ok)
		return 0
	}
	return i
}

// 转换成字节数组切片
func RecoverByteSlice(v interface{}) []byte {
	u, ok := v.([]byte)
	if !ok {
		global.Log.Error(ok)
		return nil
	}
	return u
}

// 错误处理
func ErrHandle(err error) {
	if err != nil {
		global.Log.Errorf("数据库操作失败！%v\n", err)
	}
	return
}

// 计算 Keccak-256 散列值
func Keccak256(data []byte) []byte {
	hash := sha3.NewLegacyKeccak256()
	hash.Write(data)
	return hash.Sum(nil)
}

// 计算topics
func Topics(str string) (Hash [32]byte) {
	eventTopic := common.BytesToHash(Keccak256([]byte(str)))
	return eventTopic
}

// 解析abi
func ParseABI(contract string) abi.ABI { //传入不同的abi的json文件，返回对应的abi.ABI事件
	contractAbiFile, err := ioutil.ReadFile(contract)
	if err != nil {
		log.Fatal(err)
	}
	eventAbi, err := abi.JSON(strings.NewReader(string(contractAbiFile)))
	if err != nil {
		log.Fatal(err)
	}
	return eventAbi
}

// 解码对应的事件
func ParseEventLog(eventName string, data []byte, conAbi abi.ABI) map[string]interface{} {

	event1 := conAbi.Events[eventName]
	res := make(map[string]interface{})
	err := event1.Inputs.UnpackIntoMap(res, data)
	if err != nil {
		fmt.Println(err)
	}
	return res
}

// 数组转换成切片
func ArrToSlice(arr [32]byte) []byte {
	// 初始化 arr 数组
	var bytesSlice []byte
	// 将 arr 转换为 []byte
	for _, b := range arr {
		bytesSlice = append(bytesSlice, b)
	}
	slice := arr[:]
	return slice
}
