package arrival

import (
    "time"
)

type TimedCache struct {
    data map[int]timedCacheItem
}

func NewTimedCache() TimedCache {
    c := TimedCache{}
    c.data = make(map[int]timedCacheItem)
    return c
}

func (c TimedCache) Get(stopId int) (interface{}, bool) {
    if t, ok := c.data[stopId]; ok && !t.isExpired() {
        return t.item, true
    }
    return nil, false
}

func (c TimedCache) Set(stopId int, item interface{}) {
    c.data[stopId] = timedCacheItem{time.Now(), item}
}

type timedCacheItem struct {
    born time.Time
    item interface{}
}

func (t timedCacheItem) isExpired() bool {
    return t.born.Add(time.Minute).Before(time.Now())
}
