package middleware

import (
	"github.com/gin-gonic/gin"
)

// 跨域中间件的配置
func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		//fmt.Println("get there-------------------------------")
		c.Header("Access-Control-Allow-Origin", "http://localhost:3000")              //允许的源，可设置为"*"表示允许任何来源访问
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS") //允许的方法
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true") //允许的请求头

		//fmt.Println(fmt.Sprintf(c.GetHeader("Access-Control-Allow-Origin")))
		//fmt.Println("上面是header")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
