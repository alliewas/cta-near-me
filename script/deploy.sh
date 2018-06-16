cd dist
rm cta-near-me-api.zip
zip cta-near-me-api.zip cta-near-me-api

cd ../

aws lambda update-function-code --function-name cta-near-me-api --zip-file fileb://dist/cta-near-me-api.zip --publish