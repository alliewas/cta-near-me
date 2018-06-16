package main

import (
	"github.com/akrylysov/algnhsa"
	"github.com/alliewas/cta-near-me/api"
)

func main() {
	algnhsa.ListenAndServe(api.Router(), nil)
}
