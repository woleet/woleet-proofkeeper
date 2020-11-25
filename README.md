# ProofKeeper

## Functionalities

ProofKeeper is Woleet's proof management tool for Windows, macOS and Linux.

Using this native application, you can automate the timestamping and signature of your sensitive files, without disclosing them to anybody, not even to Woleet.

### How it works

The tool automatically scans a set of folders that you define, and timestamps or signs any files found.

Once the proof receipts are ready, the tool automatically gathers them from the Woleet platform and stores them beside the timestamped or signed files (in a Chainpoint file named 'filename'-'anchorID'.(anchor|signature)-receipt.json).

The tool rescans the set folders every 15 minutes, so any file added to one of the folders will be automatically timestamped or signed. 

To sum up, this tool can be used to generate and maintain the set of timestamped proofs of existence or signature for all the files of a set of directories.

### Limitations

* All files and folders beginning by '.' or finished by '.(anchor|signature)-(receipt|pending).json' are ignored
* Symlinks are not followed
* The maximum length of the sub-folder path (without delimiters) is 128 characters

### Using regular expression

If you want to timestamp or sign only a subset of the files present in a folder or a sub-folder, you can use the regex option which will limit the scope of this tool to the files that matches the provided regular expression, you can test the regex here: https://regex-golang.appspot.com/assets/html/index.html.

## Installation

The latest installers can be found [here](https://github.com/woleet/woleet-proofkeeper/releases)

There are few version available:

| File name                   | OS/version                   |
|-----------------------------|---------------------------|
| ProofKeeper-x.x.x.dmg       | macOS version             |
| ProofKeeper.x.x.x.AppImage  | Linux version             |
| ProofKeeper.x.x.x.exe       | Portable Windows version  |
| ProofKeeper.Setup.x.x.x.exe | Installer Windows version |

Just download it and execute it (add execution permissions if necessary).

## Development

To be able to develop on this app, you need to install node dependencies (At least Node.js 8 is required):

``` bash
npm install
```

Then download binaries of woleet-cli (actual version 0.3.0) and start the app:

``` bash
# Download binaries
./getBins.sh 0.5.1

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

After this step the packages apps will be available in the docker-release/ folder.

Another folder will be created: docker-cache it will contains the node_modules folder used by the docker container as well as the ~/.cache folder of the container which contains the electron releases.
