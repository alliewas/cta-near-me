package api

import (
	"encoding/json"
	"log"
	"net/http"
    "strconv"
    "github.com/alliewas/cta-near-me/station"
    "github.com/alliewas/cta-near-me/arrival"
)

func Nearby(w http.ResponseWriter, r *http.Request) {
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("latitude"), 64)
	long, _ := strconv.ParseFloat(r.URL.Query().Get("longitude"), 64)
	log.Printf("nearby lat %v long %v", lat, long)

    nearbyStations := station.StationsNear(lat, long)
    loadArrivals(nearbyStations)
    log.Printf("stations: %v", nearbyStations)

	response, _ := json.Marshal(nearbyStations)
	w.Write(response)
}

func Lines(w http.ResponseWriter, r *http.Request) {
    response, _ := json.Marshal(station.Lines)
    w.Write(response)
}

func Stations(w http.ResponseWriter, r *http.Request) {
    lineKey := r.URL.Query().Get("line")

    stations := station.StationsForLine(lineKey)

    response, _ := json.Marshal(stations)
    w.Write(response)
}

func Station(w http.ResponseWriter, r *http.Request) {
    log.Printf("loading station")
    lineKey := r.URL.Query().Get("line")
    stationId, _ := strconv.ParseInt(r.URL.Query().Get("stationId"), 10, 64)
    station := station.GetStation(lineKey, int(stationId))
    loadStationArrivals(station)
    response, _ := json.Marshal(station)
    w.Write(response)
}

func loadArrivals(stations []station.StationWrapper) {
    for _, station := range stations {
        loadStationArrivals(station)
    }
}

func loadStationArrivals(station station.StationWrapper) {
    log.Printf("loading station: %v", station.Name)
    for _, stop := range station.StopArrivals {
        stop.Arrivals, _ = arrival.Load(stop.StopId)
    }
}
