import { app, BrowserWindow, Tray, Menu } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win, liveenv, tray;
const args = process.argv.slice(1);
liveenv = args.some(val => val === '--liveenv');
declare var global:any;

global.liveenv = liveenv

if (liveenv) {
  require('electron-reload')([__dirname], {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  });
}

function createWindow () {
  win = new BrowserWindow({
    width: 800, 
    height: 600,
    icon: path.join(__dirname, './dist/woleet-gui/assets/images/woleet.png')
  })

  win.loadURL(url.format({
    pathname: path.join(__dirname, './dist/woleet-gui/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', () => {
  createWindow()
  tray = new Tray(path.join(__dirname, './dist/woleet-gui/assets/images/woleet.png'))
  var contextMenu = Menu.buildFromTemplate([
    { label: 'Exit', click: function() {
      app.quit()
    }}
  ]);
  tray.setToolTip('WoleetGui');
  tray.setContextMenu(contextMenu);
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
