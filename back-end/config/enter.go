package config

type Config struct {
	Mysql    Mysql    `yaml:"mysql"`
	Logger   Logger   `yaml:"logger"`
	Encrypt  Encrypt  `yaml:"encrypt"`
	Contract Contract `yaml:"contract"`
}
