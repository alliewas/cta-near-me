package arrival

import (
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"
)

var key, timeLayout string
var cache TimedCache

func init() {
	key = os.Getenv("CTA_API_KEY")
	timeLayout = "20060102 15:04:05"
	cache = NewTimedCache()
}

func Load(stopId int) ([]Eta, error) {
	if cached, ok := cache.Get(stopId); ok {
		log.Printf("cached stop %v", stopId)
		return cached.([]Eta), nil
	}
	log.Printf("fetching stop %v", stopId)
	url := fmt.Sprintf("http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=%s&stpid=%d", key, stopId)
	response, err := http.Get(url)
	if err != nil {
		log.Printf("failed: %v", err)
		return nil, err
	} else {
		defer response.Body.Close()
		bytes, err := ioutil.ReadAll(response.Body)
		var result ctatt
		err = xml.Unmarshal(bytes, &result)
		if err != nil {
			log.Printf("failed: %v", err)
			return nil, err
		} else {
			etas := etas(result.Etas)
			cache.Set(stopId, etas)
			return etas, nil
		}
	}
}

type ctatt struct {
	Tmst string `xml:"tmst"`
	Etas []eta  `xml:"eta"`
}

type eta struct {
	Route         string `xml:"rt"`
	StationId     int    `xml:"staId"`
	StopId        int    `xml:"stpId"`
	IsApproaching bool   `xml:"isApp"`
	IsScheduled   bool   `xml:"isSch"`
	IsDelayed     bool   `xml:"isDly"`
	PredictedAt   string `xml:"prdt"`
	ArrivingAt    string `xml:"arrT"`
}

type Eta struct {
	Route             string
	StationId         int
	StopId            int
	IsApproaching     bool
	IsScheduled       bool
	IsDelayed         bool
	PredictedAt       time.Time
	ArrivingAt        time.Time
	ArrivingInMinutes int64
}

func etas(in []eta) []Eta {
	chicago, _ := time.LoadLocation("America/Chicago")
	out := make([]Eta, len(in))
	for i, v := range in {
		predictedAt, _ := time.Parse(timeLayout, v.PredictedAt)
		arrivingAt, _ := time.ParseInLocation(timeLayout, v.ArrivingAt, chicago)
		arrivingInMinutes := arrivingAt.Sub(time.Now()) / time.Minute
		out[i] = Eta{
			v.Route,
			v.StationId,
			v.StopId,
			v.IsApproaching,
			v.IsScheduled,
			v.IsDelayed,
			predictedAt,
			arrivingAt,
			int64(arrivingInMinutes),
		}
	}
	return out
}

/*
<?xml version="1.0" encoding="utf-8"?>
    <ctatt>
        <tmst>20140525 18:53:18</tmst>
        <errCd>0</errCd>
        <errNm />
        <eta>
            <staId>40100</staId>
            <stpId>30020</stpId>
            <staNm>Morse</staNm>
            <stpDe>Service toward Howard</stpDe>
            <rn>811</rn>
            <rt>Red</rt>
            <destSt>30173</destSt>
            <destNm>Howard</destNm>
            <trDr>1</trDr>
            <prdt>20140525 18:52:27</prdt>
            <arrT>20140525 18:54:27</arrT>
            <isApp>0</isApp>
            <isSch>0</isSch>
            <isDly>0</isDly>
            <isFlt>0</isFlt>
            <flags />
            <lat>41.99366</lat>
            <lon>-87.6592</lon>
            <heading>356</heading>
        </eta>
        <eta>
            <staId>40100</staId>
            <stpId>30020</stpId>
            <staNm>Morse</staNm>
            <stpDe>Service toward Howard</stpDe>
            <rn>816</rn>
            <rt>Red</rt>
            <destSt>30173</destSt>
            <destNm>Howard</destNm>
            <trDr>1</trDr>
            <prdt>20140525 18:52:59</prdt>
            <arrT>20140525 19:00:59</arrT>
            <isApp>0</isApp>
            <isSch>0</isSch>
            <isDly>0</isDly>
            <isFlt>0</isFlt>
            <flags />
            <lat>41.96665</lat>
            <lon>-87.65835</lon>
            <heading>348</heading>
        </eta>
        <eta>
            <staId>40100</staId>
            <stpId>30020</stpId>
            <staNm>Morse</staNm>
            <stpDe>Service toward Howard</stpDe>
            <rn>910</rn>
            <rt>Red</rt>
            <destSt>30173</destSt>
            <destNm>Howard</destNm>
            <trDr>1</trDr>
            <prdt>20140525 18:52:04</prdt>
            <arrT>20140525 19:05:04</arrT>
            <isApp>0</isApp>
            <isSch>0</isSch>
            <isDly>0</isDly>
            <isFlt>0</isFlt>
            <flags />
            <lat>41.93975</lat>
            <lon>-87.65338</lon>
            <heading>359</heading>
        </eta>
        <eta>
            <staId>40100</staId>
            <stpId>30020</stpId>
            <staNm>Morse</staNm>
            <stpDe>Service toward Howard</stpDe>
            <rn>911</rn>
            <rt>Red</rt>
            <destSt>30173</destSt>
            <destNm>Howard</destNm>
            <trDr>1</trDr>
            <prdt>20140525 18:52:49</prdt>
            <arrT>20140525 19:10:49</arrT>
            <isApp>0</isApp>
            <isSch>0</isSch>
            <isDly>0</isDly>
            <isFlt>0</isFlt>
            <flags />
            <lat>41.9096</lat>
            <lon>-87.6477</lon>
            <heading>305</heading>
        </eta>
    </ctatt>
*/
