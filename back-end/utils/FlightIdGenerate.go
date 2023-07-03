package utils

import (
	"airline/global"
	"crypto/md5"
	"fmt"
	"github.com/rs/xid"
)

func FlightIdGenerate() (idStr string) { //使用xid进行航班单号的随机生成

	id := xid.New()

	containerName := global.Config.Encrypt.Xid
	fmt.Println(containerName)

	containerNameID := make([]byte, 3)
	hw := md5.New()
	hw.Write([]byte(containerName))
	copy(containerNameID, hw.Sum(nil))
	id[4] = containerNameID[0]
	id[5] = containerNameID[1]
	id[6] = containerNameID[2]

	idStr = id.String()

	return idStr

}
