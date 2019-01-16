# ProofKeeper

## Developpement

To be able to develop on this app, you need to install node dependencies (Node.js 8 is required):

``` bash
npm install
```

Then download binaries of woleet-cli (actual version 0.1.2) and start the app:

``` bash
# Download binaries
./getBins.sh 0.1.3

# Start the app
npm start
```

The app will be available in a electron window with live refresh after the build by angular.

## Build

Use these commands to build the packaged apps for each OS, you will be able to find them in the release/ folder.

``` bash
# Linux
npm run electron:linux

# MacOS
npm run electron:mac

# Windows
npm run electron:windows
```