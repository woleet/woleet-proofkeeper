#!/usr/bin/env bash

set -e

if ! [[ $1 =~ [0-9]\.[0-9]\.[0-9] ]]
then
  echo "usage: $0 (release number)"
  echo "release number format: [0-9].[0-9].[0-9]"
  exit 1
fi

RELEASE_NUMBER=$1
PLATFORMS=( "linux" "darwin" "windows" )

rm -rf src/assets/bin

for PLATFORM in "${PLATFORMS[@]}"
do
  CURL_PARAMETERS="-L --silent https://github.com/woleet/woleet-cli/releases/download/${RELEASE_NUMBER}/woleet-cli_${RELEASE_NUMBER}_${PLATFORM}_x86_64.tar.gz --output woleet-cli_${PLATFORM}_x86_64.tar.gz"

  if [ "$PLATFORM" != "windows" ]
  then
    curl ${CURL_PARAMETERS}
    tar -xzf "woleet-cli_${PLATFORM}_x86_64.tar.gz"
    rm "woleet-cli_${PLATFORM}_x86_64.tar.gz"
    mkdir -p "src/assets/bin/${PLATFORM}"
    mv woleet-cli "src/assets/bin/${PLATFORM}/woleet-cli"
  else
    curl ${CURL_PARAMETERS//'.tar.gz'/'.zip'}
    unzip -q "woleet-cli_${PLATFORM}_x86_64.zip"
    rm "woleet-cli_${PLATFORM}_x86_64.zip"
    mkdir -p "src/assets/bin/${PLATFORM}"
    mv woleet-cli.exe "src/assets/bin/${PLATFORM}/woleet-cli"
  fi
done
