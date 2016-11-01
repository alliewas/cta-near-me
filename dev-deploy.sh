./build.sh
docker build -t cta-near-me .
docker stop cta-near-me
docker rm cta-near-me
docker run \
    -p 3455:80 \
    -p 3456:443 \
    --name cta-near-me \
    -v ~/code/go/src/github.com/alliewas/cta-near-me/static:/src/github.com/alliewas/cta-near-me/static \
    -d \
    -e CTA_API_KEY \
    cta-near-me
docker logs -f --tail=20 cta-near-me
