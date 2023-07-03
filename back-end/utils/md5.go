package utils

import (
	"airline/global"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
)

// MD5 加密
func Md5(msg string) string {

	key := msg + global.Config.Encrypt.Md5
	fmt.Println(key)
	keys, _ := json.Marshal(key)

	m := md5.New()
	m.Write(keys)
	res := hex.EncodeToString(m.Sum(nil))
	return res
}

// 带密钥的MD5加密 用于存身份证
func Md5WithKey(data, key string) string {
	// 将密钥和原始数据拼接在一起
	s := key + data

	// 创建 md5 加密器
	hasher := md5.New()

	// 将需要加密的数据传入加密器
	hasher.Write([]byte(s))

	// 获取加密结果
	hash := hasher.Sum(nil)

	// 将结果转换为字符串形式
	return hex.EncodeToString(hash)
}
