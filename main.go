package main

import (
	"fmt"
	"github.com/alliewas/cta-near-me/api"
	"github.com/alliewas/cta-near-me/config"
	"github.com/gorilla/mux"
	"html/template"
	"log"
	"net/http"
)

func main() {
	log.Printf("starting up")

	router := mux.NewRouter()
	router.HandleFunc("/", index).Methods("GET")

	router.HandleFunc("/api/nearby", api.Nearby).Methods("GET")
	router.HandleFunc("/api/lines", api.Lines).Methods("GET")
	router.HandleFunc("/api/stations", api.Stations).Methods("GET")
	router.HandleFunc("/api/station", api.Station).Methods("GET")
	router.HandleFunc("/api/stops", api.Stops).Methods("GET")

	router.PathPrefix("/").Handler(http.FileServer(http.Dir(fmt.Sprintf("%s/static/", config.Get().Host.Path))))
	http.Handle("/", router)

	port := config.Get().Host.Port
	log.Printf("Serving on port %v", port)
	log.Fatal(http.ListenAndServe(port, nil))
}

var indexTemplate = template.Must(template.ParseFiles(fmt.Sprintf("%s/template/index.html", config.Get().Host.Path)))

func index(w http.ResponseWriter, r *http.Request) {
	indexTemplate.Execute(w, nil)
}
