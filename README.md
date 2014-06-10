cta-near-me
===========

The backend is in Go, and the frontend is in AngularJS.

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
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o cta-near-me.linux
echo "Uploading"
ssh -l sirsean ctanear.me mkdir -p cta-near-me
ssh -l sirsean ctanear.me rm cta-near-me/cta-near-me.linux
scp cta-near-me.linux sirsean@ctanear.me:cta-near-me/
scp -r template sirsean@ctanear.me:cta-near-me/
scp -r static sirsean@ctanear.me:cta-near-me/
echo "Restarting"
ssh -l root ctanear.me systemctl restart cta-near-me.service
echo "Deployed"
```

Note that you will need to set up your system to cross-compile for your target environment. (I deploy to a 64-bit Linux server.)

