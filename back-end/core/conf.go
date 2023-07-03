package core

import (
	"airline/config"
	"airline/global"
	"fmt"

	"gopkg.in/yaml.v2"
	"io/ioutil"
	"log"
)

func InitConf() { //读取并且初始化conf
	const ConfigFile = "settings.yaml"
	c := &config.Config{}
	yamlConf, err := ioutil.ReadFile(ConfigFile)
	if err != nil {
		panic(fmt.Errorf("get yamlConf error: %s", err))
	}
	err = yaml.Unmarshal(yamlConf, c)
	if err != nil {
		log.Fatalf("config Init Unmarshal: %v", err)
	}
	log.Println("config yamlFile load Init success.")
	global.Config = c

	//fmt.Println(global.Config)

}
