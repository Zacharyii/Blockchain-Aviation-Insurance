package utils

import (
	"crypto/rand"
	"math/big"
)

func OrderIdGenerate() string {
	length := 9 //生成随机数长度为9
	const charset = "0123456789"
	maxIdx := big.NewInt(int64(len(charset))) // 定义一个最大值，作为后面生成随机数的上限

	b := make([]byte, length)
	for i := range b {
		rndIdx, err := rand.Int(rand.Reader, maxIdx) // 生成随机数
		if err != nil {
			return ""
		}
		b[i] = charset[rndIdx.Int64()]
	}

	return string(b)
}
