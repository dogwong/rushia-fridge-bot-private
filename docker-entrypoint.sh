#!/bin/sh
# CHANGES TO THIS FILE REQUIRES REBUILD DOCKER IMAGE
echo "docker entrypoint start"

echo "=> git fetch"
git fetch

echo "=> reset git"
git checkout .
git clean fd
#git clean -fdx

echo "=> git pull"
git checkout master
git pull origin master

echo "=> npm install"
npm install

echo ""
echo "=> DONE"
echo ""

node index.js
