# ProofKeeper

## Functionalities

ProofKeeper is Woleet's proof management tool for Windows, macOS and Linux.

Using this native application, you can automate the timestamping and sealing of your sensitive files, without disclosing them to anybody, not even to Woleet.

### How it works

The tool automatically scans a set of folders that you define, and timestamps or seals all files found (or a sub-part matching a regular expression).

Once the proof receipts are ready, the tool automatically gathers them from the Woleet platform and stores them beside the timestamped or sealed files (in a Chainpoint file named 'filename'-'proofID'.(timestamp|seal)-receipt.json).

The tool rescans the folders every 15 minutes, so any file added to one of the folders will be automatically timestamped or sealed. 

To sum up, this tool can be used to generate and maintain the set of proofs of timestamp or proof of seal for all the files of a set of directories.

### Limitations

* All files and folders beginning by '.' or finished by '.(timestamp|seal)-(receipt|pending).json' are ignored
* Symlinks are not followed

### Using regular expression

If you want to timestamp or seal only a subset of the files in a folder, you can define a regular expression limiting the scope of this tool to the files matching this expression (you can test the regular expression here: https://regex-golang.appspot.com/assets/html/index.html).

## Installation

The latest installers can be found [here](https://github.com/woleet/woleet-proofkeeper/releases)

There are few version available:

| File name                              | OS/version                             |
|----------------------------------------|----------------------------------------|
| ProofKeeper-x.x.x-macOS.dmg            | macOS version                          |
| ProofKeeper-x.x.x-Linux.AppImage       | Linux version                          |
| ProofKeeper-x.x.x-Portable-Windows.exe | Portable Windows version               |
| ProofKeeper-x.x.x-Setup-Windows.exe    | Installer Windows version              |

Just download it and execute it (add execution permissions if necessary).

## Development

To be able to develop on this app, you need to install node dependencies (At least Node.js 8 is required):

``` bash
npm install
```

Then download the latest binaries of woleet-cli and start the app:

``` bash
# Download binaries
./getBins.sh 0.6.0

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
