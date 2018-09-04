#!/usr/bin/env bash

set -e

if !( [[ $1 =~ [0-9]\.[0-9]\.[0-9] ]] && [[ $2 =~ linux|darwin|windows ]] )
then
  echo "usage: $0 (release number) (Os)"
  echo "release number format: [0-9].[0-9].[0-9]"
  echo "Os available: linux/darwin/windows"
  exit 1
fi

RELEASE_NUMBER=$1
PLATFORM=$2
CURL_PARAMETERS="-L --silent https://github.com/woleet/woleet-cli/releases/download/${RELEASE_NUMBER}/woleet-cli_${RELEASE_NUMBER}_${PLATFORM}_x86_64.tar.gz --output woleet-cli_${PLATFORM}_x86_64.tar.gz"

if [ "$PLATFORM" != "windows" ]
then
  curl ${CURL_PARAMETERS}
  tar -xzf woleet-cli_${PLATFORM}_x86_64.tar.gz 
else
  curl ${CURL_PARAMETERS//'.tar.gz'/'.zip'}
  unzip -q woleet-cli_${PLATFORM}_x86_64.zip
fi
