package station

import (
    "sort"
    "github.com/kellydunn/golang-geo"
    "github.com/alliewas/cta-near-me/arrival"
)

type Line struct {
	Key   string // Red, Blue, Brn, G, Org, P, Pexp, Pink, Y
	Name  string
	Color string
}

type Station struct {
	StationId int
	LineKey   string // Red, Blue, Brn, G, Org, P, Pexp, Pink, Y
	Name      string
	Longitude float64
	Latitude  float64
	Stops     []Stop
}

func (s Station) Point() *geo.Point {
    return geo.NewPoint(s.Latitude, s.Longitude)
}

type StationWrapper struct {
    Station
    Distance float64
    StopArrivals []*StopWrapper
}

type stationSorter struct {
    stations []StationWrapper
    by func(s1, s2 StationWrapper) bool
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

func newSorter(nearbyStations []StationWrapper) stationSorter {
    return stationSorter{
        nearbyStations,
        func(s1, s2 StationWrapper) bool {
            return s1.Distance < s2.Distance
        },
    }
}

type Stop struct {
	StopId    int
	Direction string // N, S, W, E
	Name      string
}

type StopWrapper struct {
    Stop
    Arrivals []arrival.Eta
}

var Lines []Line
var stations map[string][]Station

func GetStation(lineKey string, stationId int) StationWrapper {
    all := stations[lineKey]
    for _, station := range all {
        if station.StationId == stationId {
            stops := make([]*StopWrapper, len(station.Stops))
            for i, stop := range station.Stops {
                stops[i] = &StopWrapper{stop, nil}
            }
            return StationWrapper{station, -1, stops}
        }
    }
    return StationWrapper{}
}

func StationsForLine(lineKey string) []Station {
    return stations[lineKey]
}

func StationsNear(latitude, longitude float64) []StationWrapper {
    point := geo.NewPoint(latitude, longitude)
    near := recurseStationsNear(point, 0.1, 5)
    sorter := newSorter(near)
    sort.Sort(sorter)
    return near
}

func recurseStationsNear(point *geo.Point, threshold float64, attemptsRemaining int) []StationWrapper {
    near := calculateStationsNear(point, threshold)
    if attemptsRemaining <= 0 {
        return near
    } else if len(near) < 2 {
        // not enough stations, increase threshold
        return recurseStationsNear(point, threshold * 2, attemptsRemaining - 1)
    } else if len(near) > 10 {
        // too many stations, decrease threshold
        return recurseStationsNear(point, threshold / 2, attemptsRemaining - 1)
    } else {
        return near
    }
}

func calculateStationsNear(point *geo.Point, threshold float64) []StationWrapper {
    near := []StationWrapper{}
    for _, stationList := range stations {
        for _, station := range stationList {
            distance := point.GreatCircleDistance(station.Point())
            if distance <= threshold {
                stops := make([]*StopWrapper, len(station.Stops))
                for i, stop := range station.Stops {
                    stops[i] = &StopWrapper{stop, nil}
                }
                wrapper := StationWrapper{station, distance, stops}
                near = append(near, wrapper)
            }
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
		Line{"Pexp", "Purple Express", "#522398"},
		Line{"Pink", "Pink", "#e27ea6"},
		Line{"Y", "Yellow", "#f9e300"},
	}

	stations = map[string][]Station{
		"Red": []Station{
			Station{40900, "Red", "Howard", -87.672892, 42.019063,
				[]Stop{
					Stop{30173, "N", "Howard (Terminal arrival)"},
					Stop{30174, "S", "Howard (95th-Bound)"},
				},
			},
			Station{41190, "Red", "Jarvis", -87.669092, 42.015876,
				[]Stop{
					Stop{30228, "S", "Jarvis (95th-bound)"},
					Stop{30227, "N", "Jarvis (Howard-bound)"},
				},
			},
			Station{40100, "Red", "Morse", -87.665909, 42.008362,
				[]Stop{
					Stop{30021, "S", "Morse (95th-bound)"},
					Stop{30020, "N", "Morse (Howard-bound)"},
				},
			},
			Station{41300, "Red", "Loyola", -87.661061, 42.001073,
				[]Stop{
					Stop{30252, "S", "Loyola (95th-bound)"},
					Stop{30251, "N", "Loyola (Howard-bound)"},
				},
			},
			Station{40760, "Red", "Granville", -87.659202, 41.993664,
				[]Stop{
					Stop{30148, "S", "Granville (95th-bound)"},
					Stop{30147, "N", "Granville (Howard-bound)"},
				},
			},
			Station{40880, "Red", "Thorndale", -87.659076, 41.990259,
				[]Stop{
					Stop{30170, "S", "Thorndale (95th-bound)"},
					Stop{30169, "N", "Thorndale (Howard-bound)"},
				},
			},
			Station{41380, "Red", "Bryn Mawr", -87.65884, 41.983504,
				[]Stop{
					Stop{30268, "S", "Bryn Mawr (95th-bound)"},
					Stop{30267, "N", "Bryn Mawr (Howard-bound)"},
				},
			},
			Station{40340, "Red", "Berwyn", -87.658668, 41.977984,
				[]Stop{
					Stop{30067, "S", "Berwyn (95th-bound)"},
					Stop{30066, "N", "Berwyn (Howard-bound)"},
				},
			},
			Station{41200, "Red", "Argyle", -87.65853, 41.973453,
				[]Stop{
					Stop{30230, "S", "Argyle (95th-bound)"},
					Stop{30229, "N", "Argyle (Howard-bound)"},
				},
			},
			Station{40770, "Red", "Lawrence", -87.658493, 41.969139,
				[]Stop{
					Stop{30150, "S", "Lawrence (95th-bound)"},
					Stop{30149, "N", "Lawrence (Howard-bound)"},
				},
			},
			Station{40540, "Red", "Wilson", -87.657588, 41.964273,
				[]Stop{
					Stop{30106, "S", "Wilson (95th-bound)"},
					Stop{30105, "N", "Wilson (Howard-bound)"},
				},
			},
			Station{40080, "Red", "Sheridan", -87.654929, 41.953775,
				[]Stop{
					Stop{30017, "S", "Sheridan (95th-bound)"},
					Stop{30016, "N", "Sheridan (Howard-bound)"},
				},
			},
			Station{41420, "Red", "Addison", -87.653626, 41.947428,
				[]Stop{
					Stop{30274, "S", "Addison (95th-bound)"},
					Stop{30273, "N", "Addison (Howard-bound)"},
				},
			},
			Station{41320, "Red", "Belmont", -87.65338, 41.939751,
				[]Stop{
					Stop{30256, "S", "Belmont (95th-bound)"},
					Stop{30255, "N", "Belmont (Howard-bound)"},
				},
			},
			Station{41220, "Red", "Fullerton", -87.652866, 41.925051,
				[]Stop{
					Stop{30234, "S", "Fullerton (95th-bound)"},
					Stop{30233, "N", "Fullerton (Howard-bound)"},
				},
			},
			Station{40650, "Red", "North/Clybourn", -87.649177, 41.910655,
				[]Stop{
					Stop{30126, "S", "North/Clybourn (95th-bound)"},
					Stop{30125, "N", "North/Clybourn (Howard-bound)"},
				},
			},
			Station{40630, "Red", "Clark/Division", -87.631412, 41.90392,
				[]Stop{
					Stop{30122, "S", "Clark/Division (95th-bound)"},
					Stop{30121, "N", "Clark/Division (Howard-bound)"},
				},
			},
			Station{41450, "Red", "Chicago", -87.628176, 41.896671,
				[]Stop{
					Stop{30280, "S", "Chicago/State (95th-bound)"},
					Stop{30279, "N", "Chicago/State (Howard-bound)"},
				},
			},
			Station{40330, "Red", "Grand", -87.628021, 41.891665,
				[]Stop{
					Stop{30065, "S", "Grand/State (95th-bound)"},
					Stop{30064, "N", "Grand/State (Howard-bound)"},
				},
			},
			Station{41660, "Red", "Lake", -87.627813, 41.884809,
				[]Stop{
					Stop{30290, "S", "Lake/State (95th-bound)"},
					Stop{30289, "N", "Lake/State (Howard-bound)"},
				},
			},
			Station{41090, "Red", "Monroe", -87.627696, 41.880745,
				[]Stop{
					Stop{30212, "S", "Monroe/State (95th-bound)"},
					Stop{30211, "N", "Monroe/State (Howard-bound)"},
				},
			},
			Station{40560, "Red", "Jackson", -87.627596, 41.878153,
				[]Stop{
					Stop{30110, "S", "Jackson/State (95th-bound)"},
					Stop{30109, "N", "Jackson/State (Howard-bound)"},
				},
			},
			Station{41490, "Red", "Harrison", -87.627479, 41.874039,
				[]Stop{
					Stop{30286, "S", "Harrison (95th-bound)"},
					Stop{30285, "N", "Harrison (Howard-bound)"},
				},
			},
			Station{41400, "Red", "Roosevelt", -87.62659, 41.867405,
				[]Stop{
					Stop{30269, "N", "Roosevelt/State (Howard-bound)"},
					Stop{30270, "S", "Roosevelt/State (Howard-bound)"},
				},
			},
			Station{41000, "Red", "Cermak-Chinatown", -87.630968, 41.853206,
				[]Stop{
					Stop{30194, "S", "Cermak-Chinatown (95th-bound)"},
					Stop{30193, "N", "Cermak-Chinatown (Howard-bound)"},
				},
			},
			Station{40190, "Red", "Sox-35th", -87.630636, 41.831191,
				[]Stop{
					Stop{30037, "S", "Sox-35th (95th-bound)"},
					Stop{30036, "N", "Sox-35th (Howard-bound)"},
				},
			},
			Station{41230, "Red", "47th", -87.63094, 41.810318,
				[]Stop{
					Stop{30238, "S", "47th-Dan Ryan (95th-bound)"},
					Stop{30237, "N", "47th-Dan Ryan (Howard-bound)"},
				},
			},
			Station{41170, "Red", "Garfield", -87.631157, 41.79542,
				[]Stop{
					Stop{30224, "S", "Garfield-Dan Ryan (95th-bound)"},
					Stop{30223, "N", "Garfield-Dan Ryan (Howard-bound)"},
				},
			},
			Station{40910, "Red", "63rd", -87.630952, 41.780536,
				[]Stop{
					Stop{30178, "S", "63rd-Dan Ryan (95th-bound)"},
					Stop{30177, "N", "63rd-Dan Ryan (Howard-bound)"},
				},
			},
			Station{40990, "Red", "69th", -87.625724, 41.768367,
				[]Stop{
					Stop{30192, "S", "69th (95th-bound)"},
					Stop{30191, "N", "69th (Howard-bound)"},
				},
			},
			Station{40240, "Red", "79th", -87.625112, 41.750419,
				[]Stop{
					Stop{30047, "S", "79th (95th-bound)"},
					Stop{30046, "N", "79th (Howard-bound)"},
				},
			},
			Station{41430, "Red", "87th", -87.624717, 41.735372,
				[]Stop{
					Stop{30276, "S", "87th (95th-bound)"},
					Stop{30275, "N", "87th (Howard-bound)"},
				},
			},
			Station{40450, "Red", "95th/Dan Ryan", -87.624342, 41.722377,
				[]Stop{
					Stop{30089, "S", "95th/Dan Ryan (95th-bound)"},
					Stop{30088, "N", "95th/Dan Ryan (Howard-bound)"},
				},
			},
		},
		"Blue": []Station{
			Station{40890, "Blue", "O'Hare", -87.90422307, 41.97766526,
				[]Stop{
					Stop{30172, "S", "O'Hare Airport (Forest Pk-bound)"},
					Stop{30171, "N", "O'Hare Airport (Terminal Arrival)"},
				},
			},
			Station{40820, "Blue", "Rosemont", -87.859388, 41.983507,
				[]Stop{
					Stop{30160, "S", "Rosemont (Forest Pk-bound)"},
					Stop{30159, "N", "Rosemont (O'Hare-bound)"},
				},
			},
			Station{40230, "Blue", "Cumberland", -87.838028, 41.984246,
				[]Stop{
					Stop{30045, "S", "Cumberland (Forest Pk-bound)"},
					Stop{30044, "N", "Cumberland (O'Hare-bound)"},
				},
			},
			Station{40750, "Blue", "Harlem", -87.8089, 41.98227,
				[]Stop{
					Stop{30146, "S", "Harlem (O'Hare Branch) (Forest Pk-bound)"},
					Stop{30145, "N", "Harlem (O'Hare Branch) (O'Hare-bound)"},
				},
			},
			Station{41280, "Blue", "Jefferson Park", -87.760892, 41.970634,
				[]Stop{
					Stop{30248, "S", "Jefferson Park (Forest Pk-bound)"},
					Stop{30247, "N", "Jefferson Park (O'Hare-bound)"},
				},
			},
			Station{41330, "Blue", "Montrose", -87.743574, 41.961539,
				[]Stop{
					Stop{30260, "S", "Montrose (Forest Pk-bound)"},
					Stop{30259, "N", "Montrose (O'Hare-bound)"},
				},
			},
			Station{40550, "Blue", "Irving Park", -87.729229, 41.952925,
				[]Stop{
					Stop{30108, "S", "Irving Park (O'Hare Branch) (Forest Pk-bound)"},
					Stop{30107, "N", "Irving Park (O'Hare Branch) (O'Hare-bound)"},
				},
			},
			Station{41240, "Blue", "Addison", -87.71906, 41.94738,
				[]Stop{
					Stop{30240, "S", "Addison (O'Hare Branch) (Forest Pk-bound)"},
					Stop{30239, "N", "Addison (O'Hare Branch) (O'Hare-bound)"},
				},
			},
			Station{40060, "Blue", "Belmont", -87.712359, 41.938132,
				[]Stop{
					Stop{30013, "S", "Belmont (O'Hare Branch) (Forest Pk-bound)"},
					Stop{30012, "N", "Belmont (O'Hare Branch) (O'Hare-bound)"},
				},
			},
			Station{41020, "Blue", "Logan Square", -87.708541, 41.929728,
				[]Stop{
					Stop{30198, "S", "Logan Square (Forest Pk-bound)"},
					Stop{30197, "N", "Logan Square (O'Hare-bound)"},
				},
			},
			Station{40570, "Blue", "California", -87.69689, 41.921939,
				[]Stop{
					Stop{30112, "S", "California/Milwaukee (Forest Pk-bound)"},
					Stop{30111, "N", "California/Milwaukee (O'Hare-bound)"},
				},
			},
			Station{40670, "Blue", "Western", -87.687364, 41.916157,
				[]Stop{
					Stop{30130, "S", "Western/Milwaukee (Forest Pk-bound)"},
					Stop{30129, "N", "Western/Milwaukee (O'Hare-bound)"},
				},
			},
			Station{40590, "Blue", "Damen", -87.677437, 41.909744,
				[]Stop{
					Stop{30116, "S", "Damen/Milwaukee (Forest Pk-bound)"},
					Stop{30115, "N", "Damen/Milwaukee (O'Hare-bound)"},
				},
			},
			Station{40320, "Blue", "Division", -87.666496, 41.903355,
				[]Stop{
					Stop{30063, "S", "Division/Milwaukee (Forest Pk-bound)"},
					Stop{30062, "N", "Division/Milwaukee (O'Hare-bound)"},
				},
			},
			Station{41410, "Blue", "Chicago", -87.655214, 41.896075,
				[]Stop{
					Stop{30272, "S", "Chicago/Milwaukee (Forest Pk-bound)"},
					Stop{30271, "N", "Chicago/Milwaukee (O'Hare-bound)"},
				},
			},
			Station{40490, "Blue", "Grand", -87.647578, 41.891189,
				[]Stop{
					Stop{30096, "S", "Grand/Milwaukee (Forest Pk-bound)"},
					Stop{30095, "N", "Grand/Milwaukee (O'Hare-bound)"},
				},
			},
			Station{40380, "Blue", "Clark/Lake", -87.630886, 41.885737,
				[]Stop{
					Stop{30374, "S", "Clark/Lake (Forest Pk-bound)"},
					Stop{30375, "N", "Clark/Lake (O'Hare-bound)"},
				},
			},
			Station{40370, "Blue", "Washington", -87.62944, 41.883164,
				[]Stop{
					Stop{30073, "S", "Washington/Dearborn (Forest Pk-bound)"},
					Stop{30072, "N", "Washington/Dearborn (O'Hare-bound)"},
				},
			},
			Station{40790, "Blue", "Monroe", -87.629378, 41.880703,
				[]Stop{
					Stop{30154, "S", "Monroe/Dearborn (Forest Pk-bound)"},
					Stop{30153, "N", "Monroe/Dearborn (O'Hare-bound)"},
				},
			},
			Station{40070, "Blue", "Jackson", -87.629296, 41.878183,
				[]Stop{
					Stop{30015, "S", "Jackson/Dearborn (Forest Pk-bound)"},
					Stop{30014, "N", "Jackson/Dearborn (O'Hare-bound)"},
				},
			},
			Station{41340, "Blue", "LaSalle", -87.631722, 41.875568,
				[]Stop{
					Stop{30262, "W", "LaSalle (Forest Pk-bound)"},
					Stop{30261, "E", "LaSalle (O'Hare-bound)"},
				},
			},
			Station{40430, "Blue", "Clinton", -87.640984, 41.875539,
				[]Stop{
					Stop{30085, "W", "Clinton (Forest Pk-bound)"},
					Stop{30084, "E", "Clinton (O'Hare-bound)"},
				},
			},
			Station{40350, "Blue", "UIC-Halsted", -87.649707, 41.875474,
				[]Stop{
					Stop{30069, "W", "UIC-Halsted (Forest Pk-bound)"},
					Stop{30068, "E", "UIC-Halsted (O'Hare-bound)"},
				},
			},
			Station{40470, "Blue", "Racine", -87.659458, 41.87592,
				[]Stop{
					Stop{30093, "W", "Racine (Forest Pk-bound)"},
					Stop{30092, "E", "Racine (O'Hare-bound)"},
				},
			},
			Station{40810, "Blue", "Illinois Medical District", -87.673932, 41.875706,
				[]Stop{
					Stop{30158, "W", "Illinois Medical District (Forest Pk-bound)"},
					Stop{30157, "E", "Illinois Medical District (O'Hare-bound)"},
				},
			},
			Station{40220, "Blue", "Western", -87.688436, 41.875478,
				[]Stop{
					Stop{30043, "W", "Western (Forest Pk-bound)"},
					Stop{30042, "E", "Western (O'Hare-bound)"},
				},
			},
			Station{40250, "Blue", "Kedzie-Homan", -87.70604, 41.874341,
				[]Stop{
					Stop{30049, "W", "Kedzie-Homan (Forest Pk-bound)"},
					Stop{30048, "E", "Kedzie-Homan (O'Hare-bound)"},
				},
			},
			Station{40920, "Blue", "Pulaski", -87.725663, 41.873797,
				[]Stop{
					Stop{30180, "W", "Pulaski (Forest Pk-bound)"},
					Stop{30179, "E", "Pulaski (O'Hare-bound)"},
				},
			},
			Station{40970, "Blue", "Cicero", -87.745154, 41.871574,
				[]Stop{
					Stop{30188, "W", "Cicero (Forest Pk-bound)"},
					Stop{30187, "E", "Cicero (O'Hare-bound)"},
				},
			},
			Station{40010, "Blue", "Austin", -87.776812, 41.870851,
				[]Stop{
					Stop{30002, "W", "Austin (Forest Pk-bound)"},
					Stop{30001, "E", "Austin (O'Hare-bound)"},
				},
			},
			Station{40180, "Blue", "Oak Park", -87.791602, 41.872108,
				[]Stop{
					Stop{30035, "W", "Oak Park (Forest Pk-bound)"},
					Stop{30034, "E", "Oak Park (O'Hare-bound)"},
				},
			},
			Station{40980, "Blue", "Harlem", -87.806961, 41.87349,
				[]Stop{
					Stop{30190, "W", "Harlem (Forest Pk-bound)"},
					Stop{30189, "E", "Harlem (O'Hare-bound)"},
				},
			},
			Station{40390, "Blue", "Forest Park", -87.817318, 41.874257,
				[]Stop{
					Stop{30076, "E", "Forest Park (O'Hare-bound)"},
					Stop{30077, "W", "Forest Park (Terminal Arrival)"},
				},
			},
		},
		"Brn": []Station{
			Station{41290, "Brn", "Kimball", -87.713065, 41.967901,
				[]Stop{
					Stop{30250, "S", "Kimball (Loop-bound)"},
					Stop{30249, "N", "Kimball (Terminal arrival)"},
				},
			},
			Station{41180, "Brn", "Kedzie", -87.708821, 41.965996,
				[]Stop{
					Stop{30225, "N", "Kedzie (Kimball-bound)"},
					Stop{30226, "S", "Kedzie (Loop-bound)"},
				},
			},
			Station{40870, "Brn", "Francisco", -87.701644, 41.966046,
				[]Stop{
					Stop{30167, "N", "Francisco (Kimball-bound)"},
					Stop{30168, "S", "Francisco (Loop-bound)"},
				},
			},
			Station{41010, "Brn", "Rockwell", -87.6941, 41.966115,
				[]Stop{
					Stop{30195, "N", "Rockwell (Kimball-bound)"},
					Stop{30196, "S", "Rockwell (Loop-bound)"},
				},
			},
			Station{41480, "Brn", "Western", -87.688502, 41.966163,
				[]Stop{
					Stop{30283, "N", "Western (Kimball-bound)"},
					Stop{30284, "S", "Western (Loop-bound)"},
				},
			},
			Station{40090, "Brn", "Damen", -87.678639, 41.966286,
				[]Stop{
					Stop{30018, "N", "Damen (Kimball-bound)"},
					Stop{30019, "S", "Damen (Loop-bound)"},
				},
			},
			Station{41500, "Brn", "Montrose", -87.675047, 41.961756,
				[]Stop{
					Stop{30287, "N", "Montrose (Kimball-bound)"},
					Stop{30288, "S", "Montrose (Loop-bound)"},
				},
			},
			Station{41460, "Brn", "Irving Park", -87.674868, 41.954521,
				[]Stop{
					Stop{30281, "N", "Irving Park (Kimball-bound)"},
					Stop{30282, "S", "Irving Park (Loop-bound)"},
				},
			},
			Station{41440, "Brn", "Addison", -87.674642, 41.947028,
				[]Stop{
					Stop{30277, "N", "Addison (Kimball-bound)"},
					Stop{30278, "S", "Addison (Loop-bound)"},
				},
			},
			Station{41310, "Brn", "Paulina", -87.670907, 41.943623,
				[]Stop{
					Stop{30253, "N", "Paulina (Kimball-bound)"},
					Stop{30254, "S", "Paulina (Loop-bound)"},
				},
			},
			Station{40360, "Brn", "Southport", -87.663619, 41.943744,
				[]Stop{
					Stop{30070, "N", "Southport (Kimball-bound)"},
					Stop{30071, "S", "Southport (Loop-bound)"},
				},
			},
			Station{41320, "Brn", "Belmont", -87.65338, 41.939751,
				[]Stop{
					Stop{30257, "N", "Belmont (Kimball-Linden-bound)"},
					Stop{30258, "S", "Belmont (Loop-bound)"},
				},
			},
			Station{41210, "Brn", "Wellington", -87.653266, 41.936033,
				[]Stop{
					Stop{30231, "N", "Wellington (Kimball-Linden-bound)"},
					Stop{30232, "S", "Wellington (Loop-bound)"},
				},
			},
			Station{40530, "Brn", "Diversey", -87.653131, 41.932732,
				[]Stop{
					Stop{30103, "N", "Diversey (Kimball-Linden-bound)"},
					Stop{30104, "S", "Diversey (Loop-bound)"},
				},
			},
			Station{41220, "Brn", "Fullerton", -87.652866, 41.925051,
				[]Stop{
					Stop{30235, "N", "Fullerton (Kimball-Linden-bound)"},
					Stop{30236, "S", "Fullerton (Loop-bound)"},
				},
			},
			Station{40660, "Brn", "Armitage", -87.652644, 41.918217,
				[]Stop{
					Stop{30127, "N", "Armitage (Kimball-Linden-bound)"},
					Stop{30128, "S", "Armitage (Loop-bound)"},
				},
			},
			Station{40800, "Brn", "Sedgwick", -87.639302, 41.910409,
				[]Stop{
					Stop{30155, "N", "Sedgwick (Kimball-Linden-bound)"},
					Stop{30156, "S", "Sedgwick (Loop-bound)"},
				},
			},
			Station{40710, "Brn", "Chicago", -87.635924, 41.89681,
				[]Stop{
					Stop{30137, "N", "Chicago/Franklin (Kimball-Linden-bound)"},
					Stop{30138, "S", "Chicago/Franklin (Loop-bound)"},
				},
			},
			Station{40460, "Brn", "Merchandise Mart", -87.633924, 41.888969,
				[]Stop{
					Stop{30090, "N", "Merchandise Mart (Kimball-Linden-bound)"},
					Stop{30091, "S", "Merchandise Mart (Loop-bound)"},
				},
			},
			Station{40730, "Brn", "Washington/Wells", -87.63378, 41.882695,
				[]Stop{
					Stop{30142, "S", "Washington/Wells (Outer Loop)"},
				},
			},
			Station{40040, "Brn", "Quincy/Wells", -87.63374, 41.878723,
				[]Stop{
					Stop{30008, "S", "Quincy/Wells (Outer Loop)"},
				},
			},
			Station{40160, "Brn", "LaSalle/Van Buren", -87.631739, 41.8768,
				[]Stop{
					Stop{30030, "E", "LaSalle/Van Buren (Outer Loop)"},
				},
			},
			Station{40850, "Brn", "Harold Washington Library-State/Van Buren", -87.628196, 41.876862,
				[]Stop{
					Stop{30165, "E", "Library (Outer Loop)"},
				},
			},
			Station{40680, "Brn", "Adams/Wabash", -87.626037, 41.879507,
				[]Stop{
					Stop{30131, "N", "Adams/Wabash (Outer Loop)"},
				},
			},
			Station{40640, "Brn", "Madison/Wabash", -87.626098, 41.882023,
				[]Stop{
					Stop{30123, "N", "Madison/Wabash (Outer Loop)"},
				},
			},
			Station{40200, "Brn", "Randolph/Wabash", -87.626149, 41.884431,
				[]Stop{
					Stop{30038, "N", "Randolph/Wabash (Outer Loop)"},
				},
			},
			Station{40260, "Brn", "State/Lake", -87.627835, 41.88574,
				[]Stop{
					Stop{30051, "W", "State/Lake (Outer Loop)"},
				},
			},
			Station{40380, "Brn", "Clark/Lake", -87.630886, 41.885737,
				[]Stop{
					Stop{30075, "W", "Clark/Lake (Outer Loop)"},
				},
			},
		},
		"G": []Station{
			Station{40020, "G", "Harlem/Lake", -87.803176, 41.886848,
				[]Stop{
					Stop{30004, "W", "Harlem (Terminal arrival)"},
					Stop{30003, "E", "Harlem (63rd-bound)"},
				},
			},
			Station{41350, "G", "Oak Park", -87.793783, 41.886988,
				[]Stop{
					Stop{30263, "E", "Oak Park (63rd-bound)"},
					Stop{30264, "W", "Oak Park (Harlem-bound)"},
				},
			},
			Station{40610, "G", "Ridgeland", -87.783661, 41.887159,
				[]Stop{
					Stop{30119, "E", "Ridgeland (63rd-bound)"},
					Stop{30120, "W", "Ridgeland (Harlem-bound)"},
				},
			},
			Station{41260, "G", "Austin", -87.774135, 41.887293,
				[]Stop{
					Stop{30243, "E", "Austin (63rd-bound)"},
					Stop{30244, "W", "Austin (Harlem-bound)"},
				},
			},
			Station{40280, "G", "Central", -87.76565, 41.887389,
				[]Stop{
					Stop{30054, "E", "Central (63rd-bound)"},
					Stop{30055, "W", "Central (Harlem-bound)"},
				},
			},
			Station{40700, "G", "Laramie", -87.754986, 41.887163,
				[]Stop{
					Stop{30135, "E", "Laramie (63rd-bound)"},
					Stop{30136, "W", "Laramie (Harlem-bound)"},
				},
			},
			Station{40480, "G", "Cicero", -87.744698, 41.886519,
				[]Stop{
					Stop{30094, "E", "Cicero (63rd-bound)"},
					Stop{30009, "W", "Cicero (Harlem-bound)"},
				},
			},
			Station{40030, "G", "Pulaski", -87.725404, 41.885412,
				[]Stop{
					Stop{30005, "E", "Pulaski (63rd-bound)"},
					Stop{30006, "W", "Pulaski (Harlem-bound)"},
				},
			},
			Station{41670, "G", "Conservatory", -87.716523, 41.884904,
				[]Stop{
					Stop{30291, "E", "Conservatory (63rd-bound)"},
					Stop{30292, "W", "Conservatory (Harlem-bound)"},
				},
			},
			Station{41070, "G", "Kedzie", -87.706155, 41.884321,
				[]Stop{
					Stop{30207, "E", "Kedzie (63rd-bound)"},
					Stop{30208, "W", "Kedzie (Harlem-bound)"},
				},
			},
			Station{41360, "G", "California", -87.696234, 41.88422,
				[]Stop{
					Stop{30265, "E", "California (63rd-bound)"},
					Stop{30266, "W", "California (Harlem-bound)"},
				},
			},
			Station{40170, "G", "Ashland", -87.666969, 41.885269,
				[]Stop{
					Stop{30032, "E", "Ashland (Harlem-54th/Cermak-bound)"},
					Stop{30033, "W", "Ashland (Loop-63rd-bound)"},
				},
			},
			Station{41510, "G", "Morgan", -87.652193, 41.885586,
				[]Stop{
					Stop{30296, "W", "Morgan (Harlem-54th/Cermak-bound)"},
					Stop{30295, "E", "Morgan (Loop-63rd-bound)"},
				},
			},
			Station{41160, "G", "Clinton", -87.641782, 41.885678,
				[]Stop{
					Stop{30222, "W", "Clinton (Harlem-54th/Cermak-bound)"},
					Stop{30221, "E", "Clinton (Loop-63rd-bound)"},
				},
			},
			Station{40380, "G", "Clark/Lake", -87.630886, 41.885737,
				[]Stop{
					Stop{30074, "E", "Clark/Lake (Inner Loop)"},
					Stop{30075, "W", "Clark/Lake (Outer Loop)"},
				},
			},
			Station{40260, "G", "State/Lake", -87.627835, 41.88574,
				[]Stop{
					Stop{30050, "E", "State/Lake (Inner Loop)"},
					Stop{30051, "W", "State/Lake (Outer Loop)"},
				},
			},
			Station{40200, "G", "Randolph/Wabash", -87.626149, 41.884431,
				[]Stop{
					Stop{30039, "S", "Randolph/Wabash (Inner Loop)"},
					Stop{30038, "N", "Randolph/Wabash (Outer Loop)"},
				},
			},
			Station{40640, "G", "Madison/Wabash", -87.626098, 41.882023,
				[]Stop{
					Stop{30124, "S", "Madison/Wabash (Inner Loop)"},
					Stop{30123, "N", "Madison/Wabash (Outer Loop)"},
				},
			},
			Station{40680, "G", "Adams/Wabash", -87.626037, 41.879507,
				[]Stop{
					Stop{30132, "S", "Adams/Wabash (Inner Loop)"},
					Stop{30131, "N", "Adams/Wabash (Outer Loop)"},
				},
			},
			Station{41400, "G", "Roosevelt", -87.62659, 41.867405,
				[]Stop{
					Stop{30080, "N", "Roosevelt/Wabash (Loop-Harlem-bound)"},
					Stop{30081, "S", "Roosevelt/Wabash (Midway-63rd-bound)"},
				},
			},
			Station{41120, "G", "35th-Bronzeville-IIT", -87.625826, 41.831677,
				[]Stop{
					Stop{30214, "S", "35-Bronzeville-IIT (63rd-bound)"},
					Stop{30213, "N", "35-Bronzeville-IIT (Harlem-bound)"},
				},
			},
			Station{40300, "G", "Indiana", -87.621371, 41.821732,
				[]Stop{
					Stop{30059, "S", "Indiana (63rd-bound)"},
					Stop{30058, "N", "Indiana (Harlem-bound)"},
				},
			},
			Station{41270, "G", "43rd", -87.619021, 41.816462,
				[]Stop{
					Stop{30246, "S", "43rd (63rd-bound)"},
					Stop{30245, "N", "43rd (Harlem-bound)"},
				},
			},
			Station{41080, "G", "47th", -87.618826, 41.809209,
				[]Stop{
					Stop{30210, "S", "47th (63rd-bound) Elevated (63rd-bound)"},
					Stop{30209, "N", "47th (SB) Elevated (Harlem-bound)"},
				},
			},
			Station{40130, "G", "51st", -87.618487, 41.80209,
				[]Stop{
					Stop{30025, "S", "51st (63rd-bound)"},
					Stop{30024, "N", "51st (Harlem-bound)"},
				},
			},
			Station{40510, "G", "Garfield", -87.618327, 41.795172,
				[]Stop{
					Stop{30100, "S", "Garfield (63rd-bound)"},
					Stop{30099, "N", "Garfield (Harlem-bound)"},
				},
			},
			Station{41140, "G", "King Drive", -87.615546, 41.78013,
				[]Stop{
					Stop{30217, "E", "King Drive (Cottage Grove-bound)"},
					Stop{30218, "W", "King Drive (Harlem-bound)"},
				},
			},
			Station{40720, "G", "Cottage Grove", -87.605857, 41.780309,
				[]Stop{
					Stop{30139, "E", "Cottage Grove (Terminal arrival)"},
					Stop{30140, "W", "East 63rd-Cottage Grove (Harlem-bound)"},
				},
			},
			Station{40940, "G", "Halsted", -87.644244, 41.778943,
				[]Stop{
					Stop{30184, "W", "Halsted/63rd (Ashland-bound)"},
					Stop{30183, "E", "Halsted/63rd (Harlem-bound)"},
				},
			},
			Station{40290, "G", "Ashland/63rd", -87.663766, 41.77886,
				[]Stop{
					Stop{30056, "E", "Ashland/63rd (Harlem-bound)"},
					Stop{30057, "W", "Ashland/63rd (Terminal arrival)"},
				},
			},
		},
		"Org": []Station{
			Station{40930, "Org", "Midway", -87.737875, 41.78661,
				[]Stop{
					Stop{30182, "S", "Midway (Arrival)"},
					Stop{30181, "N", "Midway (Loop-bound)"},
				},
			},
			Station{40960, "Org", "Pulaski", -87.724493, 41.799756,
				[]Stop{
					Stop{30185, "N", "Pulaski (Loop-bound)"},
					Stop{30186, "S", "Pulaski (Midway-bound)"},
				},
			},
			Station{41150, "Org", "Kedzie", -87.704406, 41.804236,
				[]Stop{
					Stop{30219, "N", "Kedzie (Loop-bound)"},
					Stop{30220, "S", "Kedzie (Midway-bound)"},
				},
			},
			Station{40310, "Org", "Western", -87.684019, 41.804546,
				[]Stop{
					Stop{30060, "N", "Western (Loop-bound)"},
					Stop{30061, "S", "Western (Midway-bound)"},
				},
			},
			Station{40120, "Org", "35th/Archer", -87.680622, 41.829353,
				[]Stop{
					Stop{30022, "N", "35th/Archer (Loop-bound)"},
					Stop{30023, "S", "35th/Archer (Midway-bound)"},
				},
			},
			Station{41060, "Org", "Ashland", -87.665317, 41.839234,
				[]Stop{
					Stop{30205, "N", "Ashland (Loop-bound)"},
					Stop{30206, "S", "Ashland (Midway-bound)"},
				},
			},
			Station{41130, "Org", "Halsted", -87.648088, 41.84678,
				[]Stop{
					Stop{30215, "N", "Halsted (Loop-bound)"},
					Stop{30216, "S", "Halsted (Midway-bound)"},
				},
			},
			Station{41400, "Org", "Roosevelt", -87.62659, 41.867405,
				[]Stop{
					Stop{30080, "N", "Roosevelt/Wabash (Loop-Harlem-bound)"},
					Stop{30081, "S", "Roosevelt/Wabash (Midway-63rd-bound)"},
				},
			},
			Station{40850, "Org", "Harold Washington Library-State/Van Buren", -87.628196, 41.876862,
				[]Stop{
					Stop{30166, "W", "Library (Inner Loop)"},
				},
			},
			Station{40160, "Org", "LaSalle/Van Buren", -87.631739, 41.8768,
				[]Stop{
					Stop{30031, "W", "LaSalle/Van Buren (Inner Loop)"},
				},
			},
			Station{40040, "Org", "Quincy/Wells", -87.63374, 41.878723,
				[]Stop{
					Stop{30007, "N", "Quincy/Wells (Inner Loop)"},
				},
			},
			Station{40730, "Org", "Washington/Wells", -87.63378, 41.882695,
				[]Stop{
					Stop{30141, "N", "Washington/Wells (Inner Loop)"},
				},
			},
			Station{40380, "Org", "Clark/Lake", -87.630886, 41.885737,
				[]Stop{
					Stop{30074, "E", "Clark/Lake (Inner Loop)"},
				},
			},
			Station{40260, "Org", "State/Lake", -87.627835, 41.88574,
				[]Stop{
					Stop{30050, "E", "State/Lake (Inner Loop)"},
				},
			},
			Station{40200, "Org", "Randolph/Wabash", -87.626149, 41.884431,
				[]Stop{
					Stop{30039, "S", "Randolph/Wabash (Inner Loop)"},
				},
			},
			Station{40640, "Org", "Madison/Wabash", -87.626098, 41.882023,
				[]Stop{
					Stop{30124, "S", "Madison/Wabash (Inner Loop)"},
				},
			},
			Station{40680, "Org", "Adams/Wabash", -87.626037, 41.879507,
				[]Stop{
					Stop{30132, "S", "Adams/Wabash (Inner Loop)"},
				},
			},
		},
		"P": []Station{
			Station{41050, "P", "Linden", -87.69073, 42.073153,
				[]Stop{
					Stop{30204, "S", "Linden (Howard-Loop-bound)"},
					Stop{30203, "N", "Linden (Linden-bound)"},
				},
			},
			Station{41250, "P", "Central", -87.685617, 42.063987,
				[]Stop{
					Stop{30242, "S", "Central-Evanston (Howard-Loop-bound)"},
					Stop{30241, "N", "Central-Evanston (Linden-bound)"},
				},
			},
			Station{40400, "P", "Noyes", -87.683337, 42.058282,
				[]Stop{
					Stop{30079, "S", "Noyes (Howard-Loop-bound)"},
					Stop{30078, "N", "Noyes (Linden-bound)"},
				},
			},
			Station{40520, "P", "Foster", -87.68356, 42.05416,
				[]Stop{
					Stop{30102, "S", "Foster (Howard-Loop-bound)"},
					Stop{30101, "N", "Foster (Linden-bound)"},
				},
			},
			Station{40050, "P", "Davis", -87.683543, 42.04771,
				[]Stop{
					Stop{30011, "S", "Davis (Howard-Loop-bound)"},
					Stop{30010, "N", "Davis (Linden-bound)"},
				},
			},
			Station{40690, "P", "Dempster", -87.681602, 42.041655,
				[]Stop{
					Stop{30134, "S", "Dempster (Howard-Loop-bound)"},
					Stop{30133, "N", "Dempster (Linden-bound)"},
				},
			},
			Station{40270, "P", "Main", -87.679538, 42.033456,
				[]Stop{
					Stop{30053, "S", "Main (Howard-Loop-bound)"},
					Stop{30052, "N", "Main (Linden-bound)"},
				},
			},
			Station{40840, "P", "South Boulevard", -87.678329, 42.027612,
				[]Stop{
					Stop{30164, "S", "South Blvd (Howard-Loop-bound)"},
					Stop{30163, "N", "South Blvd (Linden-bound)"},
				},
			},
			Station{40900, "P", "Howard", -87.672892, 42.019063,
				[]Stop{
					Stop{30175, "N", "Howard (NB) (Linden, Skokie-bound)"},
					Stop{30176, "S", "Howard (Terminal arrival)"},
				},
			},
		},
		"Pexp": []Station{
			Station{41050, "Pexp", "Linden", -87.69073, 42.073153,
				[]Stop{
					Stop{30204, "S", "Linden (Howard-Loop-bound)"},
					Stop{30203, "N", "Linden (Linden-bound)"},
				},
			},
			Station{41250, "Pexp", "Central", -87.685617, 42.063987,
				[]Stop{
					Stop{30242, "S", "Central-Evanston (Howard-Loop-bound)"},
					Stop{30241, "N", "Central-Evanston (Linden-bound)"},
				},
			},
			Station{40400, "Pexp", "Noyes", -87.683337, 42.058282,
				[]Stop{
					Stop{30079, "S", "Noyes (Howard-Loop-bound)"},
					Stop{30078, "N", "Noyes (Linden-bound)"},
				},
			},
			Station{40520, "Pexp", "Foster", -87.68356, 42.05416,
				[]Stop{
					Stop{30102, "S", "Foster (Howard-Loop-bound)"},
					Stop{30101, "N", "Foster (Linden-bound)"},
				},
			},
			Station{40050, "Pexp", "Davis", -87.683543, 42.04771,
				[]Stop{
					Stop{30011, "S", "Davis (Howard-Loop-bound)"},
					Stop{30010, "N", "Davis (Linden-bound)"},
				},
			},
			Station{40690, "Pexp", "Dempster", -87.681602, 42.041655,
				[]Stop{
					Stop{30134, "S", "Dempster (Howard-Loop-bound)"},
					Stop{30133, "N", "Dempster (Linden-bound)"},
				},
			},
			Station{40270, "Pexp", "Main", -87.679538, 42.033456,
				[]Stop{
					Stop{30053, "S", "Main (Howard-Loop-bound)"},
					Stop{30052, "N", "Main (Linden-bound)"},
				},
			},
			Station{40840, "Pexp", "South Boulevard", -87.678329, 42.027612,
				[]Stop{
					Stop{30164, "S", "South Blvd (Howard-Loop-bound)"},
					Stop{30163, "N", "South Blvd (Linden-bound)"},
				},
			},
			Station{40900, "Pexp", "Howard", -87.672892, 42.019063,
				[]Stop{
					Stop{30175, "N", "Howard (NB) (Linden, Skokie-bound)"},
					Stop{30176, "S", "Howard (Terminal arrival)"},
				},
			},
			Station{41320, "Pexp", "Belmont", -87.65338, 41.939751,
				[]Stop{
					Stop{30257, "N", "Belmont (Kimball-Linden-bound)"},
					Stop{30258, "S", "Belmont (Loop-bound)"},
				},
			},
			Station{41210, "Pexp", "Wellington", -87.653266, 41.936033,
				[]Stop{
					Stop{30231, "N", "Wellington (Kimball-Linden-bound)"},
					Stop{30232, "S", "Wellington (Loop-bound)"},
				},
			},
			Station{40530, "Pexp", "Diversey", -87.653131, 41.932732,
				[]Stop{
					Stop{30103, "N", "Diversey (Kimball-Linden-bound)"},
					Stop{30104, "S", "Diversey (Loop-bound)"},
				},
			},
			Station{41220, "Pexp", "Fullerton", -87.652866, 41.925051,
				[]Stop{
					Stop{30235, "N", "Fullerton (Kimball-Linden-bound)"},
					Stop{30236, "S", "Fullerton (Loop-bound)"},
				},
			},
			Station{40660, "Pexp", "Armitage", -87.652644, 41.918217,
				[]Stop{
					Stop{30127, "N", "Armitage (Kimball-Linden-bound)"},
					Stop{30128, "S", "Armitage (Loop-bound)"},
				},
			},
			Station{40800, "Pexp", "Sedgwick", -87.639302, 41.910409,
				[]Stop{
					Stop{30155, "N", "Sedgwick (Kimball-Linden-bound)"},
					Stop{30156, "S", "Sedgwick (Loop-bound)"},
				},
			},
			Station{40710, "Pexp", "Chicago", -87.635924, 41.89681,
				[]Stop{
					Stop{30137, "N", "Chicago/Franklin (Kimball-Linden-bound)"},
					Stop{30138, "S", "Chicago/Franklin (Loop-bound)"},
				},
			},
			Station{40460, "Pexp", "Merchandise Mart", -87.633924, 41.888969,
				[]Stop{
					Stop{30090, "N", "Merchandise Mart (Kimball-Linden-bound)"},
					Stop{30091, "S", "Merchandise Mart (Loop-bound)"},
				},
			},
			Station{40380, "Pexp", "Clark/Lake", -87.630886, 41.885737,
				[]Stop{
					Stop{30074, "E", "Clark/Lake (Inner Loop)"},
				},
			},
			Station{40260, "Pexp", "State/Lake", -87.627835, 41.88574,
				[]Stop{
					Stop{30050, "E", "State/Lake (Inner Loop)"},
				},
			},
			Station{40200, "Pexp", "Randolph/Wabash", -87.626149, 41.884431,
				[]Stop{
					Stop{30039, "S", "Randolph/Wabash (Inner Loop)"},
				},
			},
			Station{40640, "Pexp", "Madison/Wabash", -87.626098, 41.882023,
				[]Stop{
					Stop{30124, "S", "Madison/Wabash (Inner Loop)"},
				},
			},
			Station{40680, "Pexp", "Adams/Wabash", -87.626037, 41.879507,
				[]Stop{
					Stop{30132, "S", "Adams/Wabash (Inner Loop)"},
				},
			},
			Station{40850, "Pexp", "Harold Washington Library-State/Van Buren", -87.628196, 41.876862,
				[]Stop{
					Stop{30166, "W", "Library (Inner Loop)"},
				},
			},
			Station{40160, "Pexp", "LaSalle/Van Buren", -87.631739, 41.8768,
				[]Stop{
					Stop{30031, "W", "LaSalle/Van Buren (Inner Loop)"},
				},
			},
			Station{40040, "Pexp", "Quincy/Wells", -87.63374, 41.878723,
				[]Stop{
					Stop{30007, "N", "Quincy/Wells (Inner Loop)"},
				},
			},
			Station{40730, "Pexp", "Washington/Wells", -87.63378, 41.882695,
				[]Stop{
					Stop{30141, "N", "Washington/Wells (Inner Loop)"},
				},
			},
		},
		"Pink": []Station{
			Station{40580, "Pink", "54th/Cermak", -87.75669201, 41.85177331,
				[]Stop{
					Stop{30113, "E", "54th/Cermak (Loop-bound)"},
					Stop{30114, "W", "54th/Cermak (Terminal arrival)"},
				},
			},
			Station{40420, "Pink", "Cicero", -87.745336, 41.85182,
				[]Stop{
					Stop{30083, "W", "Cicero (54th/Cermak-bound)"},
					Stop{30082, "E", "Cicero (Loop-bound)"},
				},
			},
			Station{40600, "Pink", "Kostner", -87.733258, 41.853751,
				[]Stop{
					Stop{30118, "W", "Kostner (54th/Cermak-bound)"},
					Stop{30117, "E", "Kostner (Loop-bound)"},
				},
			},
			Station{40150, "Pink", "Pulaski", -87.724311, 41.853732,
				[]Stop{
					Stop{30029, "W", "Pulaski (54th/Cermak-bound)"},
					Stop{30028, "E", "Pulaski (Loop-bound)"},
				},
			},
			Station{40780, "Pink", "Central Park", -87.714842, 41.853839,
				[]Stop{
					Stop{30152, "W", "Central Park (54th/Cermak-bound)"},
					Stop{30151, "E", "Central Park (Loop-bound)"},
				},
			},
			Station{41040, "Pink", "Kedzie", -87.705408, 41.853964,
				[]Stop{
					Stop{30202, "W", "Kedzie (54th/Cermak-bound)"},
					Stop{30201, "E", "Kedzie (Loop-bound)"},
				},
			},
			Station{40440, "Pink", "California", -87.694774, 41.854109,
				[]Stop{
					Stop{30087, "W", "California (54th/Cermak-bound)"},
					Stop{30086, "E", "California (Loop-bound)"},
				},
			},
			Station{40740, "Pink", "Western", -87.685129, 41.854225,
				[]Stop{
					Stop{30144, "W", "Western (54th/Cermak-bound)"},
					Stop{30143, "E", "Western (Loop-bound)"},
				},
			},
			Station{40210, "Pink", "Damen", -87.675975, 41.854517,
				[]Stop{
					Stop{30041, "W", "Damen (54th/Cermak-bound)"},
					Stop{30040, "E", "Damen (Loop-bound)"},
				},
			},
			Station{40830, "Pink", "18th", -87.669147, 41.857908,
				[]Stop{
					Stop{30162, "W", "18th (54th/Cermak-bound)"},
					Stop{30161, "E", "18th (Loop-bound)"},
				},
			},
			Station{41030, "Pink", "Polk", -87.66953, 41.871551,
				[]Stop{
					Stop{30200, "W", "Polk (54th/Cermak-bound)"},
					Stop{30199, "E", "Polk (Loop-bound)"},
				},
			},
			Station{40170, "Pink", "Ashland", -87.666969, 41.885269,
				[]Stop{
					Stop{30032, "E", "Ashland (Harlem-54th/Cermak-bound)"},
					Stop{30033, "W", "Ashland (Loop-63rd-bound)"},
				},
			},
			Station{41510, "Pink", "Morgan", -87.652193, 41.885586,
				[]Stop{
					Stop{30296, "W", "Morgan (Harlem-54th/Cermak-bound)"},
					Stop{30295, "E", "Morgan (Loop-63rd-bound)"},
				},
			},
			Station{41160, "Pink", "Clinton", -87.641782, 41.885678,
				[]Stop{
					Stop{30222, "W", "Clinton (Harlem-54th/Cermak-bound)"},
					Stop{30221, "E", "Clinton (Loop-63rd-bound)"},
				},
			},
			Station{40380, "Pink", "Clark/Lake", -87.630886, 41.885737,
				[]Stop{
					Stop{30074, "E", "Clark/Lake (Inner Loop)"},
				},
			},
			Station{40260, "Pink", "State/Lake", -87.627835, 41.88574,
				[]Stop{
					Stop{30050, "E", "State/Lake (Inner Loop)"},
				},
			},
			Station{40200, "Pink", "Randolph/Wabash", -87.626149, 41.884431,
				[]Stop{
					Stop{30039, "S", "Randolph/Wabash (Inner Loop)"},
				},
			},
			Station{40640, "Pink", "Madison/Wabash", -87.626098, 41.882023,
				[]Stop{
					Stop{30124, "S", "Madison/Wabash (Inner Loop)"},
				},
			},
			Station{40680, "Pink", "Adams/Wabash", -87.626037, 41.879507,
				[]Stop{
					Stop{30132, "S", "Adams/Wabash (Inner Loop)"},
				},
			},
			Station{40850, "Pink", "Harold Washington Library-State/Van Buren", -87.628196, 41.876862,
				[]Stop{
					Stop{30166, "W", "Library (Inner Loop)"},
				},
			},
			Station{40160, "Pink", "LaSalle/Van Buren", -87.631739, 41.8768,
				[]Stop{
					Stop{30031, "W", "LaSalle/Van Buren (Inner Loop)"},
				},
			},
			Station{40040, "Pink", "Quincy/Wells", -87.63374, 41.878723,
				[]Stop{
					Stop{30007, "N", "Quincy/Wells (Inner Loop)"},
				},
			},
			Station{40730, "Pink", "Washington/Wells", -87.63378, 41.882695,
				[]Stop{
					Stop{30141, "N", "Washington/Wells (Inner Loop)"},
				},
			},
		},
		"Y": []Station{
			Station{40140, "Y", "Skokie", -87.751919, 42.038951,
				[]Stop{
					Stop{30026, "N", "Skokie (Arrival)"},
					Stop{30027, "S", "Skokie (Howard-bound)"},
				},
			},
			Station{41680, "Y", "Oakton-Skokie", -87.74722084, 42.02624348,
				[]Stop{
					Stop{30297, "N", "Oakton (Dempster-Skokie-bound)"},
					Stop{30298, "S", "Oakton (Howard-bound)"},
				},
			},
			Station{40900, "Y", "Howard", -87.672892, 42.019063,
				[]Stop{
					Stop{30175, "N", "Howard (NB) (Linden, Skokie-bound)"},
					Stop{30176, "S", "Howard (Terminal arrival)"},
				},
			},
		},
	}
}

