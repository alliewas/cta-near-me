FROM debian:latest

MAINTAINER Sean Schulte

RUN apt-get update --yes
RUN apt-get dist-upgrade --yes

RUN apt-get install --yes \
    curl \
    git

RUN curl -O https://storage.googleapis.com/golang/go1.6.2.linux-amd64.tar.gz

RUN tar -C /usr/local -xzf go1.6.2.linux-amd64.tar.gz

ENV PATH $PATH:/usr/local/go/bin

ENV GOPATH /

ADD . /src/github.com/alliewas/cta-near-me
WORKDIR /src/github.com/alliewas/cta-near-me

RUN go build

ENTRYPOINT ["./cta-near-me"]
