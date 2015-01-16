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
go build
./cta-near-me
```

Keep the JSX building:

```
./watch-jsx.sh
```

Keep the app building:

```
./watch-build.sh
```

**Note:** You'll need to run all three of those in separate Terminals, since they run in the foreground.

# Deployment

To deploy the backend, you will need to compile it for your production environment and upload the executable file and the template files to the server.

## /etc/cta-near-me/cta-near-me.gcfg

You will need this file whether you're developing locally or deploying to a server.

```
[CtaApi]
key = xxxxxxxxxx
[Host]
port = :80
path = /path/to/cta-near-me
```

Get your API key [from the CTA](http://www.transitchicago.com/developers/traintracker.aspx).

## systemd config

Edit `/lib/systemd/system/cta-near-me.service`:

```
[Unit]
Description=ctanear.me web service
After=syslog.target network.target

[Service]
Type=simple
ExecStart=/path/to/cta-near-me/cta-near-me.linux

[Install]
WantedBy=multi-user.target
```

Then, make a symbolic link:

```
ln -s /lib/systemd/system/cta-near-me.service /etc/systemd/system/cta-near-me.service
```

And start/enable your service:

```
systemctl start cta-near-me.service
systemctl enable cta-near-me.service
```

## compile/upload/deploy script

I deploy with a script like this:

```
echo "Compiling"
cd cta-near-me; GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o cta-near-me.linux; cd ..
echo "Uploading"
pwd
tar cvf cta-near-me.tar cta-near-me/cta-near-me.linux cta-near-me/template cta-near-me/static
ssh -l sirsean ctanear.me mkdir -p cta-near-me
ssh -l sirsean ctanear.me rm cta-near-me/cta-near-me.linux
scp cta-near-me.tar sirsean@ctanear.me:cta-near-me.tar
ssh -l sirsean ctanear.me tar xvf cta-near-me.tar
echo "Restarting"
ssh -l root ctanear.me systemctl restart cta-near-me.service
echo "Deployed"

```

Note that you will need to set up your system to cross-compile for your target environment. (I deploy to a 64-bit Linux server.)

