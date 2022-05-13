#!/usr/bin/env bash

set -e

CLI_CURRENT_VERSION='0.6.0'
PROJECT_FOLDER='/project'

./getBins.sh $CLI_CURRENT_VERSION

docker run --pull always -it --rm --name proofkeeper-builder \
-v "${PWD}/angular.json:$PROJECT_FOLDER/angular.json:ro" \
-v "${PWD}/angular.webpack.js:$PROJECT_FOLDER/angular.webpack.js:ro" \
-v "${PWD}/electron-builder.json:$PROJECT_FOLDER/electron-builder.json:ro" \
-v "${PWD}/electron.ts:$PROJECT_FOLDER/electron.ts:ro" \
-v "${PWD}/package.json:$PROJECT_FOLDER/package.json:ro" \
-v "${PWD}/package-lock.json:$PROJECT_FOLDER/package-lock.orig:ro" \
-v "${PWD}/build:$PROJECT_FOLDER/build:ro" \
-v "${PWD}/tsconfig.json:$PROJECT_FOLDER/tsconfig.json:ro" \
-v "${PWD}/tslint.json:$PROJECT_FOLDER/tslint.json:ro" \
-v "${PWD}/src:$PROJECT_FOLDER/src:ro" \
-v "${PWD}/docker-node_modules:$PROJECT_FOLDER/node_modules:rw" \
-v "${PWD}/docker-release:$PROJECT_FOLDER/docker-release:rw" \
--entrypoint bash \
electronuserland/builder:14-wine -c 'rm -rf docker-release/* && cp package-lock.orig package-lock.json && npm i -g npm &&'\
'npm install && npm run build:prod && '\
'npm run electron:linux-nobuild && '\
'npm run electron:windows-nobuild  && '\
'export RELEASE=$(grep "version" package.json | grep -oE "([[:digit:]]\.)+[[:digit:]]") && '\
'mv release/* docker-release/ && '\
'chown -R '"$(id -u "$(whoami)"):$(id -g "$(whoami)")"' docker-release && '\
'chown -R '"$(id -u "$(whoami)"):$(id -g "$(whoami)")"' node_modules'
