package config

import (
    "log"
    "code.google.com/p/gcfg"
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
    err := gcfg.ReadFileInto(&cfg, "/etc/cta-near-me/cta-near-me.gcfg")
    if err != nil {
        log.Printf("Failed to read config: %v", err)
    } else {
        loaded = true
    }
}
