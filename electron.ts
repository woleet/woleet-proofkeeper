import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win, reload;
const args = process.argv.slice(1);
reload = args.some(val => val === '--reload');

if (reload) {
  require('electron-reload')([__dirname], {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  });
}

function createWindow () {
  win = new BrowserWindow({width: 800, height: 600})

  win.loadURL(url.format({
    pathname: path.join(__dirname, './dist/woleet-gui/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

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
