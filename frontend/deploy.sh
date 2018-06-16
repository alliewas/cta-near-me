cp html/index.html dist/index.html
cp -R css dist/css
cp -R img dist/img

aws s3 sync dist s3://ctanear.me --acl public-read