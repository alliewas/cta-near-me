package config

import (
	"code.google.com/p/gcfg"
	"log"
	"os"
)

type Config struct {
	CtaApi struct {
		Key string
	}

	Host struct {
		Port string
		Path string
	}
}

var cfg Config
var loaded bool

func Get() Config {
	if !loaded {
		Load()
	}
	return cfg
}

func Load() {
	var file string
	if len(os.Args) > 1 {
		file = os.Args[1]
	} else {
		file = "/etc/cta-near-me/cta-near-me.gcfg"
	}
	log.Printf("Loading from config file: %v", file)
	err := gcfg.ReadFileInto(&cfg, file)
	if err != nil {
		log.Printf("Failed to read config: %v", err)
	} else {
		loaded = true
	}
}
