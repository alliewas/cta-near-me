package api

import (
	"encoding/json"
	"github.com/alliewas/cta-near-me/arrival"
	"github.com/alliewas/cta-near-me/station"
	"log"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"sync"
)

func Nearby(w http.ResponseWriter, r *http.Request) {
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("latitude"), 64)
	long, _ := strconv.ParseFloat(r.URL.Query().Get("longitude"), 64)
	log.Printf("nearby lat %v long %v", lat, long)

	nearbyStations := station.StationsNear(lat, long)
	loadArrivals(nearbyStations)
	log.Printf("stations: %v", nearbyStations)

	response, _ := json.Marshal(nearbyStations)
	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
}

func Lines(w http.ResponseWriter, r *http.Request) {
	response, _ := json.Marshal(station.Lines)
	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
}

func Stations(w http.ResponseWriter, r *http.Request) {
	lineKey := r.URL.Query().Get("line")
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("latitude"), 64)
	long, _ := strconv.ParseFloat(r.URL.Query().Get("longitude"), 64)

	stations := station.StationsForLine(lineKey, lat, long)

	response, _ := json.Marshal(stations)
	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
}

func Station(w http.ResponseWriter, r *http.Request) {
	log.Printf("loading station")
	stationId, _ := strconv.ParseInt(r.URL.Query().Get("stationId"), 10, 64)
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("latitude"), 64)
	long, _ := strconv.ParseFloat(r.URL.Query().Get("longitude"), 64)
	station := station.GetStation(int(stationId), lat, long)

	var wg sync.WaitGroup
	loadStationArrivals(station, &wg)
	wg.Wait()

	response, _ := json.Marshal(station)
	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
}

func Stops(w http.ResponseWriter, r *http.Request) {
	log.Printf("loading stops")
	stopIdStrings := strings.Split(r.URL.Query().Get("stopIds"), ",")
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("latitude"), 64)
	long, _ := strconv.ParseFloat(r.URL.Query().Get("longitude"), 64)

	stopIds := make([]int, len(stopIdStrings))
	for i, stopIdString := range stopIdStrings {
		stopId, _ := strconv.ParseInt(stopIdString, 10, 64)
		stopIds[i] = int(stopId)
	}

	var wg sync.WaitGroup
	wg.Add(len(stopIds))
	stopEtas := NewLoadedStopArrivals()
	for _, stopId := range stopIds {
		go func(stopId int, stopEtas loadedStopArrivals, wg *sync.WaitGroup) {
			a, _ := arrival.Load(stopId)
			stopEtas.Set(stopId, a)
			wg.Done()
		}(stopId, stopEtas, &wg)
	}
	wg.Wait()

	stationStops := make(map[int]map[int]bool)
	for _, etas := range stopEtas.All() {
		for _, eta := range etas {
			if _, ok := stationStops[eta.StationId]; !ok {
				stationStops[eta.StationId] = make(map[int]bool)
			}
			stationStops[eta.StationId][eta.StopId] = true
		}
	}
	log.Printf("station stops: %v", stationStops)

	stations := make([]station.StationWrapper, 0, len(stationStops))
	for stationId, stopIdMap := range stationStops {
		s := station.GetStation(stationId, lat, long)
		for _, stop := range s.StopArrivals {
			if stopIdMap[stop.StopId] {
				stop.SetArrivals(stopEtas.Get(stop.StopId))
			}
		}
		stations = append(stations, s)
	}

	sorter := station.NewStationSorter(stations)
	sort.Sort(sorter)

	response, _ := json.Marshal(stations)
	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
}

type loadedStopArrivals struct {
	sync.RWMutex
	data map[int][]arrival.Eta
}

func NewLoadedStopArrivals() loadedStopArrivals {
	c := loadedStopArrivals{}
	c.data = make(map[int][]arrival.Eta)
	return c
}

func (c loadedStopArrivals) Get(stopId int) []arrival.Eta {
	c.Lock()
	defer c.Unlock()
	return c.data[stopId]
}

func (c loadedStopArrivals) Set(stopId int, etas []arrival.Eta) {
	c.Lock()
	defer c.Unlock()
	c.data[stopId] = etas
}

func (c loadedStopArrivals) All() map[int][]arrival.Eta {
	c.Lock()
	defer c.Unlock()
	return c.data
}

func loadArrivals(stations []station.StationWrapper) {
	var wg sync.WaitGroup
	for _, station := range stations {
		loadStationArrivals(station, &wg)
	}
	wg.Wait()
}

func loadStationArrivals(s station.StationWrapper, wg *sync.WaitGroup) {
	log.Printf("loading station: %v", s.Name)
	wg.Add(len(s.StopArrivals))
	for _, stop := range s.StopArrivals {
		go func(stop *station.StopWrapper, wg *sync.WaitGroup) {
			arrivals, _ := arrival.Load(stop.StopId)
			stop.SetArrivals(arrivals)
			wg.Done()
		}(stop, wg)
	}
}
