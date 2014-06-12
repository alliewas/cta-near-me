package api

import (
	"encoding/json"
	"log"
	"net/http"
    "strconv"
    "sync"
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
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("latitude"), 64)
	long, _ := strconv.ParseFloat(r.URL.Query().Get("longitude"), 64)

    stations := station.StationsForLine(lineKey, lat, long)

    response, _ := json.Marshal(stations)
    w.Write(response)
}

func Station(w http.ResponseWriter, r *http.Request) {
    log.Printf("loading station")
    stationId, _ := strconv.ParseInt(r.URL.Query().Get("stationId"), 10, 64)
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("latitude"), 64)
	long, _ := strconv.ParseFloat(r.URL.Query().Get("longitude"), 64)
    station := station.GetStation(int(stationId), lat, long)
    loadStationArrivals(station)
    response, _ := json.Marshal(station)
    w.Write(response)
}

func loadArrivals(stations []station.StationWrapper) {
    var wg sync.WaitGroup
    for _, station := range stations {
        loadStationArrivals(station, &wg)
    }
    wg.Wait()
}

func loadStationArrivals(station station.StationWrapper, wg *sync.WaitGroup) {
    log.Printf("loading station: %v", station.Name)
    wg.Add(len(station.StopArrivals))
    for _, stop := range station.StopArrivals {
        go func(wg *sync.WaitGroup) {
            stop.Arrivals, _ = arrival.Load(stop.StopId)
            wg.Done()
        }(&wg)
    }
}
