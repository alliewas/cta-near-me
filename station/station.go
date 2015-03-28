package station

import (
	"github.com/alliewas/cta-near-me/arrival"
	"github.com/kellydunn/golang-geo"
	"sort"
)

type Line struct {
	Key   string // Red, Blue, Brn, G, Org, P, Pexp, Pink, Y
	Name  string
	Color string
}

type Station struct {
	StationId int
	Name      string
	Longitude float64
	Latitude  float64
	Stops     []Stop
}

func (s Station) Point() *geo.Point {
	return geo.NewPoint(s.Latitude, s.Longitude)
}

func (s Station) KilometersFrom(latitude, longitude float64) (kilometers float64) {
	if latitude != 0 && longitude != 0 {
		point := geo.NewPoint(latitude, longitude)
		kilometers = point.GreatCircleDistance(s.Point())
	} else {
		kilometers = -1
	}
	return
}

func (s Station) Wrap(kilometers float64) StationWrapper {
	return newStationWrapper(s, kilometers)
}

type StationWrapper struct {
	Station
	Kilometers   float64
	StopArrivals []*StopWrapper
}

func newStationWrapper(station Station, kilometers float64) StationWrapper {
	stops := make([]*StopWrapper, len(station.Stops))
	for i, stop := range station.Stops {
		stops[i] = &StopWrapper{stop, nil}
	}
	return StationWrapper{station, kilometers, stops}
}

type stationSorter struct {
	stations []StationWrapper
	by       func(s1, s2 StationWrapper) bool
}

func (s stationSorter) Len() int {
	return len(s.stations)
}

func (s stationSorter) Swap(i, j int) {
	s.stations[i], s.stations[j] = s.stations[j], s.stations[i]
}

func (s stationSorter) Less(i, j int) bool {
	return s.by(s.stations[i], s.stations[j])
}

func NewStationSorter(nearbyStations []StationWrapper) stationSorter {
	return stationSorter{
		nearbyStations,
		func(s1, s2 StationWrapper) bool {
			return s1.Kilometers < s2.Kilometers
		},
	}
}

type Stop struct {
	StopId    int
	LineKey   string // Red, Blue, Brn, G, Org, P, Pexp, Pink, Y
	Direction string // N, S, W, E
	Name      string
}

type StopWrapper struct {
	Stop
	Arrivals []arrival.Eta
}

func (s *StopWrapper) SetArrivals(arrivals []arrival.Eta) {
	s.Arrivals = make([]arrival.Eta, 0)
	for _, eta := range arrivals {
		if eta.Route == s.LineKey {
			s.Arrivals = append(s.Arrivals, eta)
		}
	}
}

var Lines []Line
var stations map[int]Station
var lineStations map[string][]Station

func GetStation(stationId int, latitude, longitude float64) StationWrapper {
	station := stations[stationId]
	kilometers := station.KilometersFrom(latitude, longitude)
	return station.Wrap(kilometers)
}

func StationsForLine(lineKey string, latitude, longitude float64) []StationWrapper {
	basicStations := lineStations[lineKey]
	wrappedStations := make([]StationWrapper, len(basicStations))
	for i, station := range basicStations {
		kilometers := station.KilometersFrom(latitude, longitude)
		wrappedStations[i] = station.Wrap(kilometers)
	}
	return wrappedStations
}

func StationsNear(latitude, longitude float64) []StationWrapper {
	point := geo.NewPoint(latitude, longitude)
	near := recurseStationsNear(point, 0.1, 5)
	sorter := NewStationSorter(near)
	sort.Sort(sorter)
	return near
}

func recurseStationsNear(point *geo.Point, threshold float64, attemptsRemaining int) []StationWrapper {
	near := calculateStationsNear(point, threshold)
	if attemptsRemaining <= 0 {
		return near
	} else if len(near) < 2 {
		// not enough stations, increase threshold
		return recurseStationsNear(point, threshold*2, attemptsRemaining-1)
	} else if len(near) > 10 {
		// too many stations, decrease threshold
		return recurseStationsNear(point, threshold/2, attemptsRemaining-1)
	} else {
		return near
	}
}

func calculateStationsNear(point *geo.Point, threshold float64) []StationWrapper {
	near := []StationWrapper{}
	for _, station := range stations {
		kilometers := point.GreatCircleDistance(station.Point())
		if kilometers <= threshold {
			wrapper := station.Wrap(kilometers)
			near = append(near, wrapper)
		}
	}
	return near
}

func init() {
	Lines = []Line{
		Line{"Red", "Red", "#c60c30"},
		Line{"Blue", "Blue", "#00a1de"},
		Line{"Brn", "Brown", "#62361b"},
		Line{"G", "Green", "#009b3a"},
		Line{"Org", "Orange", "#f9461c"},
		Line{"P", "Purple", "#522398"},
		Line{"Pink", "Pink", "#e27ea6"},
		Line{"Y", "Yellow", "#f9e300"},
	}

	stations = map[int]Station{
		40900: Station{40900, "Howard", -87.672892, 42.019063,
			[]Stop{
				Stop{30173, "Red", "N", "Terminal arrival"},
				Stop{30174, "Red", "S", "95th"},
				Stop{30175, "P", "N", "Linden, Skokie"},
				Stop{30176, "P", "S", "Terminal arrival"},
				Stop{30175, "Y", "N", "Linden, Skokie"},
				Stop{30176, "Y", "S", "Terminal arrival"},
			},
		},
		41190: Station{41190, "Jarvis", -87.669092, 42.015876,
			[]Stop{
				Stop{30228, "Red", "S", "95th"},
				Stop{30227, "Red", "N", "Howard"},
			},
		},
		40100: Station{40100, "Morse", -87.665909, 42.008362,
			[]Stop{
				Stop{30021, "Red", "S", "95th"},
				Stop{30020, "Red", "N", "Howard"},
			},
		},
		41300: Station{41300, "Loyola", -87.661061, 42.001073,
			[]Stop{
				Stop{30252, "Red", "S", "95th"},
				Stop{30251, "Red", "N", "Howard"},
			},
		},
		40760: Station{40760, "Granville", -87.659202, 41.993664,
			[]Stop{
				Stop{30148, "Red", "S", "95th"},
				Stop{30147, "Red", "N", "Howard"},
			},
		},
		40880: Station{40880, "Thorndale", -87.659076, 41.990259,
			[]Stop{
				Stop{30170, "Red", "S", "95th"},
				Stop{30169, "Red", "N", "Howard"},
			},
		},
		41380: Station{41380, "Bryn Mawr", -87.65884, 41.983504,
			[]Stop{
				Stop{30268, "Red", "S", "95th"},
				Stop{30267, "Red", "N", "Howard"},
			},
		},
		40340: Station{40340, "Berwyn", -87.658668, 41.977984,
			[]Stop{
				Stop{30067, "Red", "S", "95th"},
				Stop{30066, "Red", "N", "Howard"},
			},
		},
		41200: Station{41200, "Argyle", -87.65853, 41.973453,
			[]Stop{
				Stop{30230, "Red", "S", "95th"},
				Stop{30229, "Red", "N", "Howard"},
			},
		},
		40770: Station{40770, "Lawrence", -87.658493, 41.969139,
			[]Stop{
				Stop{30150, "Red", "S", "95th"},
				Stop{30149, "Red", "N", "Howard"},
			},
		},
		40540: Station{40540, "Wilson", -87.657588, 41.964273,
			[]Stop{
				Stop{30106, "Red", "S", "95th"},
				Stop{30105, "Red", "N", "Howard"},
			},
		},
		40080: Station{40080, "Sheridan", -87.654929, 41.953775,
			[]Stop{
				Stop{30017, "Red", "S", "95th"},
				Stop{30016, "Red", "N", "Howard"},
			},
		},
		41420: Station{41420, "Addison", -87.653626, 41.947428,
			[]Stop{
				Stop{30274, "Red", "S", "95th"},
				Stop{30273, "Red", "N", "Howard"},
			},
		},
		41320: Station{41320, "Belmont", -87.65338, 41.939751,
			[]Stop{
				Stop{30256, "Red", "S", "95th"},
				Stop{30255, "Red", "N", "Howard"},
				Stop{30257, "Brn", "N", "Kimball"},
				Stop{30258, "Brn", "S", "Loop"},
				Stop{30257, "P", "N", "Linden"},
				Stop{30258, "P", "S", "Loop"},
			},
		},
		41220: Station{41220, "Fullerton", -87.652866, 41.925051,
			[]Stop{
				Stop{30234, "Red", "S", "95th"},
				Stop{30233, "Red", "N", "Howard"},
				Stop{30235, "Brn", "N", "Kimball"},
				Stop{30236, "Brn", "S", "Loop"},
				Stop{30235, "P", "N", "Linden"},
				Stop{30236, "P", "S", "Loop"},
			},
		},
		40650: Station{40650, "North/Clybourn", -87.649177, 41.910655,
			[]Stop{
				Stop{30126, "Red", "S", "95th"},
				Stop{30125, "Red", "N", "Howard"},
			},
		},
		40630: Station{40630, "Clark/Division", -87.631412, 41.90392,
			[]Stop{
				Stop{30122, "Red", "S", "95th"},
				Stop{30121, "Red", "N", "Howard"},
			},
		},
		41450: Station{41450, "Chicago", -87.628176, 41.896671,
			[]Stop{
				Stop{30280, "Red", "S", "95th"},
				Stop{30279, "Red", "N", "Howard"},
			},
		},
		40330: Station{40330, "Grand", -87.628021, 41.891665,
			[]Stop{
				Stop{30065, "Red", "S", "95th"},
				Stop{30064, "Red", "N", "Howard"},
			},
		},
		41660: Station{41660, "Lake", -87.627813, 41.884809,
			[]Stop{
				Stop{30290, "Red", "S", "95th"},
				Stop{30289, "Red", "N", "Howard"},
			},
		},
		41090: Station{41090, "Monroe", -87.627696, 41.880745,
			[]Stop{
				Stop{30212, "Red", "S", "95th"},
				Stop{30211, "Red", "N", "Howard"},
			},
		},
		40560: Station{40560, "Jackson", -87.627596, 41.878153,
			[]Stop{
				Stop{30110, "Red", "S", "95th"},
				Stop{30109, "Red", "N", "Howard"},
			},
		},
		41490: Station{41490, "Harrison", -87.627479, 41.874039,
			[]Stop{
				Stop{30286, "Red", "S", "95th"},
				Stop{30285, "Red", "N", "Howard"},
			},
		},
		41400: Station{41400, "Roosevelt", -87.62659, 41.867405,
			[]Stop{
				Stop{30269, "Red", "N", "Howard"},
				Stop{30270, "Red", "S", "95th"},
				Stop{30080, "G", "N", "Loop-Harlem"},
				Stop{30081, "G", "S", "Midway-63rd"},
				Stop{30080, "Org", "N", "Loop-Harlem"},
				Stop{30081, "Org", "S", "Midway-63rd"},
			},
		},
		41000: Station{41000, "Cermak-Chinatown", -87.630968, 41.853206,
			[]Stop{
				Stop{30194, "Red", "S", "95th"},
				Stop{30193, "Red", "N", "Howard"},
			},
		},
		40190: Station{40190, "Sox-35th", -87.630636, 41.831191,
			[]Stop{
				Stop{30037, "Red", "S", "95th"},
				Stop{30036, "Red", "N", "Howard"},
			},
		},
		41230: Station{41230, "47th", -87.63094, 41.810318,
			[]Stop{
				Stop{30238, "Red", "S", "95th"},
				Stop{30237, "Red", "N", "Howard"},
			},
		},
		41170: Station{41170, "Garfield", -87.631157, 41.79542,
			[]Stop{
				Stop{30224, "Red", "S", "95th"},
				Stop{30223, "Red", "N", "Howard"},
			},
		},
		40910: Station{40910, "63rd", -87.630952, 41.780536,
			[]Stop{
				Stop{30178, "Red", "S", "95th"},
				Stop{30177, "Red", "N", "Howard"},
			},
		},
		40990: Station{40990, "69th", -87.625724, 41.768367,
			[]Stop{
				Stop{30192, "Red", "S", "95th"},
				Stop{30191, "Red", "N", "Howard"},
			},
		},
		40240: Station{40240, "79th", -87.625112, 41.750419,
			[]Stop{
				Stop{30047, "Red", "S", "95th"},
				Stop{30046, "Red", "N", "Howard"},
			},
		},
		41430: Station{41430, "87th", -87.624717, 41.735372,
			[]Stop{
				Stop{30276, "Red", "S", "95th"},
				Stop{30275, "Red", "N", "Howard"},
			},
		},
		40450: Station{40450, "95th/Dan Ryan", -87.624342, 41.722377,
			[]Stop{
				Stop{30089, "Red", "S", "95th"},
				Stop{30088, "Red", "N", "Howard"},
			},
		},
		40890: Station{40890, "O'Hare", -87.90422307, 41.97766526,
			[]Stop{
				Stop{30172, "Blue", "S", "Forest Pk"},
				Stop{30171, "Blue", "N", "Terminal Arrival"},
			},
		},
		40820: Station{40820, "Rosemont", -87.859388, 41.983507,
			[]Stop{
				Stop{30160, "Blue", "S", "Forest Pk"},
				Stop{30159, "Blue", "N", "O'Hare"},
			},
		},
		40230: Station{40230, "Cumberland", -87.838028, 41.984246,
			[]Stop{
				Stop{30045, "Blue", "S", "Forest Pk"},
				Stop{30044, "Blue", "N", "O'Hare"},
			},
		},
		40750: Station{40750, "Harlem", -87.8089, 41.98227,
			[]Stop{
				Stop{30146, "Blue", "S", "Forest Pk"},
				Stop{30145, "Blue", "N", "O'Hare"},
			},
		},
		41280: Station{41280, "Jefferson Park", -87.760892, 41.970634,
			[]Stop{
				Stop{30248, "Blue", "S", "Forest Pk"},
				Stop{30247, "Blue", "N", "O'Hare"},
			},
		},
		41330: Station{41330, "Montrose", -87.743574, 41.961539,
			[]Stop{
				Stop{30260, "Blue", "S", "Forest Pk"},
				Stop{30259, "Blue", "N", "O'Hare"},
			},
		},
		40550: Station{40550, "Irving Park", -87.729229, 41.952925,
			[]Stop{
				Stop{30108, "Blue", "S", "Forest Pk"},
				Stop{30107, "Blue", "N", "O'Hare"},
			},
		},
		41240: Station{41240, "Addison", -87.71906, 41.94738,
			[]Stop{
				Stop{30240, "Blue", "S", "Forest Pk"},
				Stop{30239, "Blue", "N", "O'Hare"},
			},
		},
		40060: Station{40060, "Belmont", -87.712359, 41.938132,
			[]Stop{
				Stop{30013, "Blue", "S", "Forest Pk"},
				Stop{30012, "Blue", "N", "O'Hare"},
			},
		},
		41020: Station{41020, "Logan Square", -87.708541, 41.929728,
			[]Stop{
				Stop{30198, "Blue", "S", "Forest Pk"},
				Stop{30197, "Blue", "N", "O'Hare"},
			},
		},
		40570: Station{40570, "California", -87.69689, 41.921939,
			[]Stop{
				Stop{30112, "Blue", "S", "Forest Pk"},
				Stop{30111, "Blue", "N", "O'Hare"},
			},
		},
		40670: Station{40670, "Western", -87.687364, 41.916157,
			[]Stop{
				Stop{30130, "Blue", "S", "Forest Pk"},
				Stop{30129, "Blue", "N", "O'Hare"},
			},
		},
		40590: Station{40590, "Damen", -87.677437, 41.909744,
			[]Stop{
				Stop{30116, "Blue", "S", "Forest Pk"},
				Stop{30115, "Blue", "N", "O'Hare"},
			},
		},
		40320: Station{40320, "Division", -87.666496, 41.903355,
			[]Stop{
				Stop{30063, "Blue", "S", "Forest Pk"},
				Stop{30062, "Blue", "N", "O'Hare"},
			},
		},
		41410: Station{41410, "Chicago", -87.655214, 41.896075,
			[]Stop{
				Stop{30272, "Blue", "S", "Forest Pk"},
				Stop{30271, "Blue", "N", "O'Hare"},
			},
		},
		40490: Station{40490, "Grand", -87.647578, 41.891189,
			[]Stop{
				Stop{30096, "Blue", "S", "Forest Pk"},
				Stop{30095, "Blue", "N", "O'Hare"},
			},
		},
		40380: Station{40380, "Clark/Lake", -87.630886, 41.885737,
			[]Stop{
				Stop{30374, "Blue", "S", "Forest Pk"},
				Stop{30375, "Blue", "N", "O'Hare"},
				Stop{30075, "Brn", "W", "Outer Loop"},
				Stop{30074, "G", "E", "Inner Loop"},
				Stop{30075, "G", "W", "Outer Loop"},
				Stop{30074, "Org", "E", "Inner Loop"},
				Stop{30074, "P", "E", "Inner Loop"},
				Stop{30074, "Pink", "E", "Inner Loop"},
			},
		},
		40370: Station{40370, "Washington", -87.62944, 41.883164,
			[]Stop{
				Stop{30073, "Blue", "S", "Forest Pk"},
				Stop{30072, "Blue", "N", "O'Hare"},
			},
		},
		40790: Station{40790, "Monroe", -87.629378, 41.880703,
			[]Stop{
				Stop{30154, "Blue", "S", "Forest Pk"},
				Stop{30153, "Blue", "N", "O'Hare"},
			},
		},
		40070: Station{40070, "Jackson", -87.629296, 41.878183,
			[]Stop{
				Stop{30015, "Blue", "S", "Forest Pk"},
				Stop{30014, "Blue", "N", "O'Hare"},
			},
		},
		41340: Station{41340, "LaSalle", -87.631722, 41.875568,
			[]Stop{
				Stop{30262, "Blue", "W", "Forest Pk"},
				Stop{30261, "Blue", "E", "O'Hare"},
			},
		},
		40430: Station{40430, "Clinton", -87.640984, 41.875539,
			[]Stop{
				Stop{30085, "Blue", "W", "Forest Pk"},
				Stop{30084, "Blue", "E", "O'Hare"},
			},
		},
		40350: Station{40350, "UIC-Halsted", -87.649707, 41.875474,
			[]Stop{
				Stop{30069, "Blue", "W", "Forest Pk"},
				Stop{30068, "Blue", "E", "O'Hare"},
			},
		},
		40470: Station{40470, "Racine", -87.659458, 41.87592,
			[]Stop{
				Stop{30093, "Blue", "W", "Forest Pk"},
				Stop{30092, "Blue", "E", "O'Hare"},
			},
		},
		40810: Station{40810, "Illinois Medical District", -87.673932, 41.875706,
			[]Stop{
				Stop{30158, "Blue", "W", "Forest Pk"},
				Stop{30157, "Blue", "E", "O'Hare"},
			},
		},
		40220: Station{40220, "Western", -87.688436, 41.875478,
			[]Stop{
				Stop{30043, "Blue", "W", "Forest Pk"},
				Stop{30042, "Blue", "E", "O'Hare"},
			},
		},
		40250: Station{40250, "Kedzie-Homan", -87.70604, 41.874341,
			[]Stop{
				Stop{30049, "Blue", "W", "Forest Pk"},
				Stop{30048, "Blue", "E", "O'Hare"},
			},
		},
		40920: Station{40920, "Pulaski", -87.725663, 41.873797,
			[]Stop{
				Stop{30180, "Blue", "W", "Forest Pk"},
				Stop{30179, "Blue", "E", "O'Hare"},
			},
		},
		40970: Station{40970, "Cicero", -87.745154, 41.871574,
			[]Stop{
				Stop{30188, "Blue", "W", "Forest Pk"},
				Stop{30187, "Blue", "E", "O'Hare"},
			},
		},
		40010: Station{40010, "Austin", -87.776812, 41.870851,
			[]Stop{
				Stop{30002, "Blue", "W", "Forest Pk"},
				Stop{30001, "Blue", "E", "O'Hare"},
			},
		},
		40180: Station{40180, "Oak Park", -87.791602, 41.872108,
			[]Stop{
				Stop{30035, "Blue", "W", "Forest Pk"},
				Stop{30034, "Blue", "E", "O'Hare"},
			},
		},
		40980: Station{40980, "Harlem", -87.806961, 41.87349,
			[]Stop{
				Stop{30190, "Blue", "W", "Forest Pk"},
				Stop{30189, "Blue", "E", "O'Hare"},
			},
		},
		40390: Station{40390, "Forest Park", -87.817318, 41.874257,
			[]Stop{
				Stop{30076, "Blue", "E", "O'Hare"},
				Stop{30077, "Blue", "W", "Terminal Arrival"},
			},
		},
		41290: Station{41290, "Kimball", -87.713065, 41.967901,
			[]Stop{
				Stop{30250, "Brn", "S", "Loop"},
				Stop{30249, "Brn", "N", "Terminal arrival"},
			},
		},
		41180: Station{41180, "Kedzie", -87.708821, 41.965996,
			[]Stop{
				Stop{30225, "Brn", "N", "Kimball"},
				Stop{30226, "Brn", "S", "Loop"},
			},
		},
		40870: Station{40870, "Francisco", -87.701644, 41.966046,
			[]Stop{
				Stop{30167, "Brn", "N", "Kimball"},
				Stop{30168, "Brn", "S", "Loop"},
			},
		},
		41010: Station{41010, "Rockwell", -87.6941, 41.966115,
			[]Stop{
				Stop{30195, "Brn", "N", "Kimball"},
				Stop{30196, "Brn", "S", "Loop"},
			},
		},
		41480: Station{41480, "Western", -87.688502, 41.966163,
			[]Stop{
				Stop{30283, "Brn", "N", "Kimball"},
				Stop{30284, "Brn", "S", "Loop"},
			},
		},
		40090: Station{40090, "Damen", -87.678639, 41.966286,
			[]Stop{
				Stop{30018, "Brn", "N", "Kimball"},
				Stop{30019, "Brn", "S", "Loop"},
			},
		},
		41500: Station{41500, "Montrose", -87.675047, 41.961756,
			[]Stop{
				Stop{30287, "Brn", "N", "Kimball"},
				Stop{30288, "Brn", "S", "Loop"},
			},
		},
		41460: Station{41460, "Irving Park", -87.674868, 41.954521,
			[]Stop{
				Stop{30281, "Brn", "N", "Kimball"},
				Stop{30282, "Brn", "S", "Loop"},
			},
		},
		41440: Station{41440, "Addison", -87.674642, 41.947028,
			[]Stop{
				Stop{30277, "Brn", "N", "Kimball"},
				Stop{30278, "Brn", "S", "Loop"},
			},
		},
		41310: Station{41310, "Paulina", -87.670907, 41.943623,
			[]Stop{
				Stop{30253, "Brn", "N", "Kimball"},
				Stop{30254, "Brn", "S", "Loop"},
			},
		},
		40360: Station{40360, "Southport", -87.663619, 41.943744,
			[]Stop{
				Stop{30070, "Brn", "N", "Kimball"},
				Stop{30071, "Brn", "S", "Loop"},
			},
		},
		41210: Station{41210, "Wellington", -87.653266, 41.936033,
			[]Stop{
				Stop{30231, "Brn", "N", "Kimball"},
				Stop{30232, "Brn", "S", "Loop"},
				Stop{30231, "P", "N", "Linden"},
				Stop{30232, "P", "S", "Loop"},
			},
		},
		40530: Station{40530, "Diversey", -87.653131, 41.932732,
			[]Stop{
				Stop{30103, "Brn", "N", "Kimball"},
				Stop{30104, "Brn", "S", "Loop"},
				Stop{30103, "P", "N", "Linden"},
				Stop{30104, "P", "S", "Loop"},
			},
		},
		40660: Station{40660, "Armitage", -87.652644, 41.918217,
			[]Stop{
				Stop{30127, "Brn", "N", "Kimball"},
				Stop{30128, "Brn", "S", "Loop"},
				Stop{30127, "P", "N", "Linden"},
				Stop{30128, "P", "S", "Loop"},
			},
		},
		40800: Station{40800, "Sedgwick", -87.639302, 41.910409,
			[]Stop{
				Stop{30155, "Brn", "N", "Kimball"},
				Stop{30156, "Brn", "S", "Loop"},
				Stop{30155, "P", "N", "Linden"},
				Stop{30156, "P", "S", "Loop"},
			},
		},
		40710: Station{40710, "Chicago", -87.635924, 41.89681,
			[]Stop{
				Stop{30137, "Brn", "N", "Kimball"},
				Stop{30138, "Brn", "S", "Loop"},
				Stop{30137, "P", "N", "Linden"},
				Stop{30138, "P", "S", "Loop"},
			},
		},
		40460: Station{40460, "Merchandise Mart", -87.633924, 41.888969,
			[]Stop{
				Stop{30090, "Brn", "N", "Kimball"},
				Stop{30091, "Brn", "S", "Loop"},
				Stop{30090, "P", "N", "Linden"},
				Stop{30091, "P", "S", "Loop"},
			},
		},
		40730: Station{40730, "Washington/Wells", -87.63378, 41.882695,
			[]Stop{
				Stop{30142, "Brn", "S", "Outer Loop"},
				Stop{30141, "Org", "N", "Inner Loop"},
				Stop{30141, "P", "N", "Inner Loop"},
				Stop{30141, "Pink", "N", "Inner Loop"},
			},
		},
		40040: Station{40040, "Quincy/Wells", -87.63374, 41.878723,
			[]Stop{
				Stop{30008, "Brn", "S", "Outer Loop"},
				Stop{30007, "Org", "N", "Inner Loop"},
				Stop{30007, "P", "N", "Inner Loop"},
				Stop{30007, "Pink", "N", "Inner Loop"},
			},
		},
		40160: Station{40160, "LaSalle/Van Buren", -87.631739, 41.8768,
			[]Stop{
				Stop{30030, "Brn", "E", "Outer Loop"},
				Stop{30031, "Org", "W", "Inner Loop"},
				Stop{30031, "P", "W", "Inner Loop"},
				Stop{30031, "Pink", "W", "Inner Loop"},
			},
		},
		40850: Station{40850, "Harold Washington Library-State/Van Buren", -87.628196, 41.876862,
			[]Stop{
				Stop{30165, "Brn", "E", "Outer Loop"},
				Stop{30166, "Org", "W", "Inner Loop"},
				Stop{30166, "P", "W", "Inner Loop"},
				Stop{30166, "Pink", "W", "Inner Loop"},
			},
		},
		40680: Station{40680, "Adams/Wabash", -87.626037, 41.879507,
			[]Stop{
				Stop{30131, "Brn", "N", "Outer Loop"},
				Stop{30132, "G", "S", "Inner Loop"},
				Stop{30131, "G", "N", "Outer Loop"},
				Stop{30132, "Org", "S", "Inner Loop"},
				Stop{30132, "P", "S", "Inner Loop"},
				Stop{30132, "Pink", "S", "Inner Loop"},
			},
		},
		40640: Station{40640, "Madison/Wabash", -87.626098, 41.882023,
			[]Stop{
				Stop{30123, "Brn", "N", "Outer Loop"},
				Stop{30124, "G", "S", "Inner Loop"},
				Stop{30123, "G", "N", "Outer Loop"},
				Stop{30124, "Org", "S", "Inner Loop"},
				Stop{30124, "P", "S", "Inner Loop"},
				Stop{30124, "Pink", "S", "Inner Loop"},
			},
		},
		40200: Station{40200, "Randolph/Wabash", -87.626149, 41.884431,
			[]Stop{
				Stop{30038, "Brn", "N", "Outer Loop"},
				Stop{30039, "G", "S", "Inner Loop"},
				Stop{30038, "G", "N", "Outer Loop"},
				Stop{30039, "Org", "S", "Inner Loop"},
				Stop{30039, "P", "S", "Inner Loop"},
				Stop{30039, "Pink", "S", "Inner Loop"},
			},
		},
		40260: Station{40260, "State/Lake", -87.627835, 41.88574,
			[]Stop{
				Stop{30051, "Brn", "W", "Outer Loop"},
				Stop{30050, "G", "E", "Inner Loop"},
				Stop{30051, "G", "W", "Outer Loop"},
				Stop{30050, "Org", "E", "Inner Loop"},
				Stop{30050, "P", "E", "Inner Loop"},
				Stop{30050, "Pink", "E", "Inner Loop"},
			},
		},
		40020: Station{40020, "Harlem/Lake", -87.803176, 41.886848,
			[]Stop{
				Stop{30004, "G", "W", "Terminal arrival"},
				Stop{30003, "G", "E", "63rd"},
			},
		},
		41350: Station{41350, "Oak Park", -87.793783, 41.886988,
			[]Stop{
				Stop{30263, "G", "E", "63rd"},
				Stop{30264, "G", "W", "Harlem"},
			},
		},
		40610: Station{40610, "Ridgeland", -87.783661, 41.887159,
			[]Stop{
				Stop{30119, "G", "E", "63rd"},
				Stop{30120, "G", "W", "Harlem"},
			},
		},
		41260: Station{41260, "Austin", -87.774135, 41.887293,
			[]Stop{
				Stop{30243, "G", "E", "63rd"},
				Stop{30244, "G", "W", "Harlem"},
			},
		},
		40280: Station{40280, "Central", -87.76565, 41.887389,
			[]Stop{
				Stop{30054, "G", "E", "63rd"},
				Stop{30055, "G", "W", "Harlem"},
			},
		},
		40700: Station{40700, "Laramie", -87.754986, 41.887163,
			[]Stop{
				Stop{30135, "G", "E", "63rd"},
				Stop{30136, "G", "W", "Harlem"},
			},
		},
		40480: Station{40480, "Cicero", -87.744698, 41.886519,
			[]Stop{
				Stop{30094, "G", "E", "63rd"},
				Stop{30009, "G", "W", "Harlem"},
			},
		},
		40030: Station{40030, "Pulaski", -87.725404, 41.885412,
			[]Stop{
				Stop{30005, "G", "E", "63rd"},
				Stop{30006, "G", "W", "Harlem"},
			},
		},
		41670: Station{41670, "Conservatory", -87.716523, 41.884904,
			[]Stop{
				Stop{30291, "G", "E", "63rd"},
				Stop{30292, "G", "W", "Harlem"},
			},
		},
		41070: Station{41070, "Kedzie", -87.706155, 41.884321,
			[]Stop{
				Stop{30207, "G", "E", "63rd"},
				Stop{30208, "G", "W", "Harlem"},
			},
		},
		41360: Station{41360, "California", -87.696234, 41.88422,
			[]Stop{
				Stop{30265, "G", "E", "63rd"},
				Stop{30266, "G", "W", "Harlem"},
			},
		},
		40170: Station{40170, "Ashland", -87.666969, 41.885269,
			[]Stop{
				Stop{30032, "G", "E", "Harlem-54th/Cermak"},
				Stop{30033, "G", "W", "Loop-63rd"},
				Stop{30032, "Pink", "E", "Harlem-54th/Cermak"},
				Stop{30033, "Pink", "W", "Loop-63rd"},
			},
		},
		41510: Station{41510, "Morgan", -87.652193, 41.885586,
			[]Stop{
				Stop{30296, "G", "W", "Harlem-54th/Cermak"},
				Stop{30295, "G", "E", "Loop-63rd"},
				Stop{30296, "Pink", "W", "Harlem-54th/Cermak"},
				Stop{30295, "Pink", "E", "Loop-63rd"},
			},
		},
		41160: Station{41160, "Clinton", -87.641782, 41.885678,
			[]Stop{
				Stop{30222, "G", "W", "Harlem-54th/Cermak"},
				Stop{30221, "G", "E", "Loop-63rd"},
				Stop{30222, "Pink", "W", "Harlem-54th/Cermak"},
				Stop{30221, "Pink", "E", "Loop-63rd"},
			},
		},
		41120: Station{41120, "35th-Bronzeville-IIT", -87.625826, 41.831677,
			[]Stop{
				Stop{30214, "G", "S", "63rd"},
				Stop{30213, "G", "N", "Harlem"},
			},
		},
		40300: Station{40300, "Indiana", -87.621371, 41.821732,
			[]Stop{
				Stop{30059, "G", "S", "63rd"},
				Stop{30058, "G", "N", "Harlem"},
			},
		},
		41270: Station{41270, "43rd", -87.619021, 41.816462,
			[]Stop{
				Stop{30246, "G", "S", "63rd"},
				Stop{30245, "G", "N", "Harlem"},
			},
		},
		41080: Station{41080, "47th", -87.618826, 41.809209,
			[]Stop{
				Stop{30210, "G", "S", "Elevated 63rd"},
				Stop{30209, "G", "N", "Elevated Harlem"},
			},
		},
		40130: Station{40130, "51st", -87.618487, 41.80209,
			[]Stop{
				Stop{30025, "G", "S", "63rd"},
				Stop{30024, "G", "N", "Harlem"},
			},
		},
		40510: Station{40510, "Garfield", -87.618327, 41.795172,
			[]Stop{
				Stop{30100, "G", "S", "63rd"},
				Stop{30099, "G", "N", "Harlem"},
			},
		},
		41140: Station{41140, "King Drive", -87.615546, 41.78013,
			[]Stop{
				Stop{30217, "G", "E", "Cottage Grove"},
				Stop{30218, "G", "W", "Harlem"},
			},
		},
		40720: Station{40720, "Cottage Grove", -87.605857, 41.780309,
			[]Stop{
				Stop{30139, "G", "E", "Terminal arrival"},
				Stop{30140, "G", "W", "Harlem"},
			},
		},
		40940: Station{40940, "Halsted", -87.644244, 41.778943,
			[]Stop{
				Stop{30184, "G", "W", "Ashland"},
				Stop{30183, "G", "E", "Harlem"},
			},
		},
		40290: Station{40290, "Ashland/63rd", -87.663766, 41.77886,
			[]Stop{
				Stop{30056, "G", "E", "Harlem"},
				Stop{30057, "G", "W", "Terminal arrival"},
			},
		},
		40930: Station{40930, "Midway", -87.737875, 41.78661,
			[]Stop{
				Stop{30182, "Org", "S", "Arrival"},
				Stop{30181, "Org", "N", "Loop"},
			},
		},
		40960: Station{40960, "Pulaski", -87.724493, 41.799756,
			[]Stop{
				Stop{30185, "Org", "N", "Loop"},
				Stop{30186, "Org", "S", "Midway"},
			},
		},
		41150: Station{41150, "Kedzie", -87.704406, 41.804236,
			[]Stop{
				Stop{30219, "Org", "N", "Loop"},
				Stop{30220, "Org", "S", "Midway"},
			},
		},
		40310: Station{40310, "Western", -87.684019, 41.804546,
			[]Stop{
				Stop{30060, "Org", "N", "Loop"},
				Stop{30061, "Org", "S", "Midway"},
			},
		},
		40120: Station{40120, "35th/Archer", -87.680622, 41.829353,
			[]Stop{
				Stop{30022, "Org", "N", "Loop"},
				Stop{30023, "Org", "S", "Midway"},
			},
		},
		41060: Station{41060, "Ashland", -87.665317, 41.839234,
			[]Stop{
				Stop{30205, "Org", "N", "Loop"},
				Stop{30206, "Org", "S", "Midway"},
			},
		},
		41130: Station{41130, "Halsted", -87.648088, 41.84678,
			[]Stop{
				Stop{30215, "Org", "N", "Loop"},
				Stop{30216, "Org", "S", "Midway"},
			},
		},
		41050: Station{41050, "Linden", -87.69073, 42.073153,
			[]Stop{
				Stop{30204, "P", "S", "Howard-Loop"},
				Stop{30203, "P", "N", "Linden"},
			},
		},
		41250: Station{41250, "Central", -87.685617, 42.063987,
			[]Stop{
				Stop{30242, "P", "S", "Howard-Loop"},
				Stop{30241, "P", "N", "Linden"},
			},
		},
		40400: Station{40400, "Noyes", -87.683337, 42.058282,
			[]Stop{
				Stop{30079, "P", "S", "Howard-Loop"},
				Stop{30078, "P", "N", "Linden"},
			},
		},
		40520: Station{40520, "Foster", -87.68356, 42.05416,
			[]Stop{
				Stop{30102, "P", "S", "Howard-Loop"},
				Stop{30101, "P", "N", "Linden"},
			},
		},
		40050: Station{40050, "Davis", -87.683543, 42.04771,
			[]Stop{
				Stop{30011, "P", "S", "Howard-Loop"},
				Stop{30010, "P", "N", "Linden"},
			},
		},
		40690: Station{40690, "Dempster", -87.681602, 42.041655,
			[]Stop{
				Stop{30134, "P", "S", "Howard-Loop"},
				Stop{30133, "P", "N", "Linden"},
			},
		},
		40270: Station{40270, "Main", -87.679538, 42.033456,
			[]Stop{
				Stop{30053, "P", "S", "Howard-Loop"},
				Stop{30052, "P", "N", "Linden"},
			},
		},
		40840: Station{40840, "South Boulevard", -87.678329, 42.027612,
			[]Stop{
				Stop{30164, "P", "S", "Howard-Loop"},
				Stop{30163, "P", "N", "Linden"},
			},
		},
		40580: Station{40580, "54th/Cermak", -87.75669201, 41.85177331,
			[]Stop{
				Stop{30113, "Pink", "E", "Loop"},
				Stop{30114, "Pink", "W", "Terminal arrival"},
			},
		},
		40420: Station{40420, "Cicero", -87.745336, 41.85182,
			[]Stop{
				Stop{30083, "Pink", "W", "54th/Cermak"},
				Stop{30082, "Pink", "E", "Loop"},
			},
		},
		40600: Station{40600, "Kostner", -87.733258, 41.853751,
			[]Stop{
				Stop{30118, "Pink", "W", "54th/Cermak"},
				Stop{30117, "Pink", "E", "Loop"},
			},
		},
		40150: Station{40150, "Pulaski", -87.724311, 41.853732,
			[]Stop{
				Stop{30029, "Pink", "W", "54th/Cermak"},
				Stop{30028, "Pink", "E", "Loop"},
			},
		},
		40780: Station{40780, "Central Park", -87.714842, 41.853839,
			[]Stop{
				Stop{30152, "Pink", "W", "54th/Cermak"},
				Stop{30151, "Pink", "E", "Loop"},
			},
		},
		41040: Station{41040, "Kedzie", -87.705408, 41.853964,
			[]Stop{
				Stop{30202, "Pink", "W", "54th/Cermak"},
				Stop{30201, "Pink", "E", "Loop"},
			},
		},
		40440: Station{40440, "California", -87.694774, 41.854109,
			[]Stop{
				Stop{30087, "Pink", "W", "54th/Cermak"},
				Stop{30086, "Pink", "E", "Loop"},
			},
		},
		40740: Station{40740, "Western", -87.685129, 41.854225,
			[]Stop{
				Stop{30144, "Pink", "W", "54th/Cermak"},
				Stop{30143, "Pink", "E", "Loop"},
			},
		},
		40210: Station{40210, "Damen", -87.675975, 41.854517,
			[]Stop{
				Stop{30041, "Pink", "W", "54th/Cermak"},
				Stop{30040, "Pink", "E", "Loop"},
			},
		},
		40830: Station{40830, "18th", -87.669147, 41.857908,
			[]Stop{
				Stop{30162, "Pink", "W", "54th/Cermak"},
				Stop{30161, "Pink", "E", "Loop"},
			},
		},
		41030: Station{41030, "Polk", -87.66953, 41.871551,
			[]Stop{
				Stop{30200, "Pink", "W", "54th/Cermak"},
				Stop{30199, "Pink", "E", "Loop"},
			},
		},
		40140: Station{40140, "Skokie", -87.751919, 42.038951,
			[]Stop{
				Stop{30026, "Y", "N", "Arrival"},
				Stop{30027, "Y", "S", "Howard"},
			},
		},
		41680: Station{41680, "Oakton-Skokie", -87.74722084, 42.02624348,
			[]Stop{
				Stop{30297, "Y", "N", "Dempster-Skokie"},
				Stop{30298, "Y", "S", "Howard"},
			},
		},
	}

	lineStations = map[string][]Station{
		"Red": []Station{
			stations[40900],
			stations[41190],
			stations[40100],
			stations[41300],
			stations[40760],
			stations[40880],
			stations[41380],
			stations[40340],
			stations[41200],
			stations[40770],
			stations[40540],
			stations[40080],
			stations[41420],
			stations[41320],
			stations[41220],
			stations[40650],
			stations[40630],
			stations[41450],
			stations[40330],
			stations[41660],
			stations[41090],
			stations[40560],
			stations[41490],
			stations[41400],
			stations[41000],
			stations[40190],
			stations[41230],
			stations[41170],
			stations[40910],
			stations[40990],
			stations[40240],
			stations[41430],
			stations[40450],
		},
		"Blue": []Station{
			stations[40890],
			stations[40820],
			stations[40230],
			stations[40750],
			stations[41280],
			stations[41330],
			stations[40550],
			stations[41240],
			stations[40060],
			stations[41020],
			stations[40570],
			stations[40670],
			stations[40590],
			stations[40320],
			stations[41410],
			stations[40490],
			stations[40380],
			stations[40370],
			stations[40790],
			stations[40070],
			stations[41340],
			stations[40430],
			stations[40350],
			stations[40470],
			stations[40810],
			stations[40220],
			stations[40250],
			stations[40920],
			stations[40970],
			stations[40010],
			stations[40180],
			stations[40980],
			stations[40390],
		},
		"Brn": []Station{
			stations[41290],
			stations[41180],
			stations[40870],
			stations[41010],
			stations[41480],
			stations[40090],
			stations[41500],
			stations[41460],
			stations[41440],
			stations[41310],
			stations[40360],
			stations[41320],
			stations[41210],
			stations[40530],
			stations[41220],
			stations[40660],
			stations[40800],
			stations[40710],
			stations[40460],
			stations[40730],
			stations[40040],
			stations[40160],
			stations[40850],
			stations[40680],
			stations[40640],
			stations[40200],
			stations[40260],
			stations[40380],
		},
		"G": []Station{
			stations[40020],
			stations[41350],
			stations[40610],
			stations[41260],
			stations[40280],
			stations[40700],
			stations[40480],
			stations[40030],
			stations[41670],
			stations[41070],
			stations[41360],
			stations[40170],
			stations[41510],
			stations[41160],
			stations[40380],
			stations[40260],
			stations[40200],
			stations[40640],
			stations[40680],
			stations[41400],
			stations[41120],
			stations[40300],
			stations[41270],
			stations[41080],
			stations[40130],
			stations[40510],
			stations[41140],
			stations[40720],
			stations[40940],
			stations[40290],
		},
		"Org": []Station{
			stations[40930],
			stations[40960],
			stations[41150],
			stations[40310],
			stations[40120],
			stations[41060],
			stations[41130],
			stations[41400],
			stations[40850],
			stations[40160],
			stations[40040],
			stations[40730],
			stations[40380],
			stations[40260],
			stations[40200],
			stations[40640],
			stations[40680],
		},
		"P": []Station{
			stations[41050],
			stations[41250],
			stations[40400],
			stations[40520],
			stations[40050],
			stations[40690],
			stations[40270],
			stations[40840],
			stations[40900],
			stations[41320],
			stations[41210],
			stations[40530],
			stations[41220],
			stations[40660],
			stations[40800],
			stations[40710],
			stations[40460],
			stations[40380],
			stations[40260],
			stations[40200],
			stations[40640],
			stations[40680],
			stations[40850],
			stations[40160],
			stations[40040],
			stations[40730],
		},
		"Pink": []Station{
			stations[40580],
			stations[40420],
			stations[40600],
			stations[40150],
			stations[40780],
			stations[41040],
			stations[40440],
			stations[40740],
			stations[40210],
			stations[40830],
			stations[41030],
			stations[40170],
			stations[41510],
			stations[41160],
			stations[40380],
			stations[40260],
			stations[40200],
			stations[40640],
			stations[40680],
			stations[40850],
			stations[40160],
			stations[40040],
			stations[40730],
		},
		"Y": []Station{
			stations[40140],
			stations[41680],
			stations[40900],
		},
	}
}
