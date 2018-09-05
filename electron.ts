import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win, liveenv, tray, nativcon;

const args = process.argv.slice(1);
liveenv = args.some(val => val === '--liveenv');

declare var global: any;
global.liveenv = liveenv;

if (liveenv) {
  require('electron-reload')([__dirname], {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  });
}

nativcon = nativeImage.createFromPath(path.join(__dirname, 'dist/woleet-gui/assets/images/woleet.png'))

function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: nativcon
  });

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/woleet-gui/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', () => {
  createWindow();
  tray = new Tray(nativcon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Exit', click: function() {
      app.quit();
    }}
  ]);
  tray.setToolTip('WoleetGui');
  tray.setContextMenu(contextMenu);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
