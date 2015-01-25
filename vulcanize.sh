#!/bin/bash -e
cd dist
mv app.html app-unvulcanized.html
../node_modules/.bin/vulcanize -o app.html app-unvulcanized.html
