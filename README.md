cta-near-me
===========

**cta-near-me** is a web app that displays upcoming arrivals for CTA (Chicago Transit Authority) trains.

# Rationale

When you open your transit app, the thing you care about is: "when is the next train coming?" This app uses your current location to get nearby train stations, and gets the schedule for those stations and shows them to you.

You can investigate the upcoming schedule for other stations, but the first page you see is what you're most likely to care about when you're on your way to the train -- or waiting at the station and wish you knew how much longer.

There are apps that do this on iOS, and apps that do this on Android. But they are slow, or ugly, or have ads. cta-near-me is a mobile web app that provides this service, looks good, and works equally well on both iOS & Android.

# Decisions

The app itself is written in React. All the React app does is look good and make requests to the server.

The server is written in Go. It serves the Javascript and provides a JSON API that enables some interesting features:

- A single request to our server results in many requests to the CTA API -- we minimize the number of requests and amount of mobile data your device uses
- Caches results -- if someone else uses the app near the same time and place as you, you don't have to wait for fresh data from the CTA

# Development

Compile and run the server:

```
./build.sh
docker build -t cta-near-me .
docker stop cta-near-me
docker rm cta-near-me
docker run \
    -p 3456:80 \
    --name cta-near-me \
    -d \
    -e CTA_API_KEY="<your key here>" \
    cta-near-me
docker logs -f --tail=20 cta-near-me
```

