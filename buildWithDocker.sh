#!/usr/bin/env bash

set -e

CLI_CURRENT_VERSION='0.2.0'
PROJECT_FOLDER='/project'

./getBins.sh $CLI_CURRENT_VERSION

docker run -it --rm \
--name proofkeeper-builder \
-v "${PWD}/angular.json:$PROJECT_FOLDER/angular.json:ro" \
-v "${PWD}/electron-builder.json:$PROJECT_FOLDER/electron-builder.json:ro" \
-v "${PWD}/electron.ts:$PROJECT_FOLDER/electron.ts:ro" \
-v "${PWD}/package.json:$PROJECT_FOLDER/package.json:ro" \
-v "${PWD}/package-lock.json:$PROJECT_FOLDER/package-lock.json:ro" \
-v "${PWD}/postinstall.js:$PROJECT_FOLDER/postinstall.js:ro" \
-v "${PWD}/tsconfig.json:$PROJECT_FOLDER/tsconfig.json:ro" \
-v "${PWD}/tslint.json:$PROJECT_FOLDER/tslint.json:ro" \
-v "${PWD}/src:$PROJECT_FOLDER/src:ro" \
-v "${PWD}/docker-cache/node_modules:$PROJECT_FOLDER/node_modules:rw" \
-v "${PWD}/docker-release:$PROJECT_FOLDER/docker-release:rw" \
-v "${PWD}/docker-cache/cache:/root/.cache:rw" \
--entrypoint bash \
electronuserland/builder:wine -c 'rm -rf docker-release/* && npm install && npm run build:prod && '\
'npm run electron:linux-nobuild && '\
'npm run electron:windows-nobuild  && '\
'export RELEASE=$(grep "version" package.json | grep -oE "([[:digit:]]\.)+[[:digit:]]") && '\
'mv "release/ProofKeeper $RELEASE.AppImage" "docker-release/ProofKeeper $RELEASE.AppImage" && '\
'mv "release/ProofKeeper $RELEASE.exe" "docker-release/ProofKeeper $RELEASE.exe" && '\
'mv "release/ProofKeeper Setup $RELEASE.exe" "docker-release/ProofKeeper Setup $RELEASE.exe" && '\
'chown -R '"$(id -u "$(whoami)"):$(id -g "$(whoami)")"' docker-release'