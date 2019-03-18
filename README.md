# ProofKeeper

## Functionnalities

ProofKeeper is Woleet's proof management tool for your desktop. Using this native application, you can automate the timestamping and signature of your sensitive files.

### General usage

The tool scans a folder recursively and anchors or sign all files found. It also gathers proof receipts and stores them beside anchored or signed files (in a Chainpoint file named 'filename'-'anchorID'.(anchor|signature)-receipt.json).

Since anchoring is not a realtime operation, the tool rescan the configured folders every 15 minutes

To sum up, this tool can be used to generate and maintain the set of timestamped proofs of existence or signature for all files in a given directory.

Note: tags are added to the anchors according to the name of sub-folders

### Limitations

* All files and folders beginning by '.' or finished by '.(anchor|signature)-(receipt|pending).json' are ignored
* Symlinks are not followed
* Scanned sub-folders cannot have a space in their name
* The maximum length of the subfolder path (without delimiters) is 128 characters

## Installation

The latest installers can be found [here](https://github.com/woleet/woleet-proofkeeper/releases)

Just download it, decompress it and execute it (add execution permissions if necessary)

## Developpement

To be able to develop on this app, you need to install node dependencies (At least Node.js 8 is required):

``` bash
npm install
```

Then download binaries of woleet-cli (actual version 0.2.0) and start the app:

``` bash
# Download binaries
./getBins.sh 0.2.0

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

Alternatively you can launch a docker to build the project, only linux and windows versions will be made (electron-builder limitation)

```bash
./buildWithDocker.sh
```

After this step the packages apps will be available in the folder docker-release.

An other folder will be created: docker-cache it will contains the node_modules folder used by the docker container as well as the ~/.cache folder of the container which contains the electron releases.
