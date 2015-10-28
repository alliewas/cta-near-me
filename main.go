package main

import (
	"github.com/alliewas/cta-near-me/api"
	"github.com/gorilla/mux"
	"html/template"
	"log"
	"net/http"
)

func main() {
	log.Printf("starting cta-near-me")

	router := mux.NewRouter()
	router.HandleFunc("/", index).Methods("GET")

	router.HandleFunc("/api/nearby", api.Nearby).Methods("GET")
	router.HandleFunc("/api/lines", api.Lines).Methods("GET")
	router.HandleFunc("/api/stations", api.Stations).Methods("GET")
	router.HandleFunc("/api/station", api.Station).Methods("GET")
	router.HandleFunc("/api/stops", api.Stops).Methods("GET")

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("/src/github.com/alliewas/cta-near-me/static/")))
	http.Handle("/", router)

	log.Fatal(http.ListenAndServe(":80", nil))
}

var indexTemplate = template.Must(template.ParseFiles("/src/github.com/alliewas/cta-near-me/template/index.html"))

func index(w http.ResponseWriter, r *http.Request) {
	indexTemplate.Execute(w, nil)
}
