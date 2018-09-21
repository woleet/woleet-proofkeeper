import { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win, liveenv, tray, nativcon;
let willQuitApp = false;

const args = process.argv.slice(1);
liveenv = args.some(val => val === '--liveenv');

declare var global: any;
global.liveenv = liveenv;

if (liveenv) {
  require('electron-reload')([__dirname], {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

nativcon = nativeImage.createFromPath(path.join(__dirname, 'dist/woleet-gui/assets/images/woleet.png'));

function createWindowTray () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 300,
    icon: nativcon
  });

  if (process.platform === 'darwin') {
    tray = new Tray(nativcon.resize({width: 20, height: 20}));
  } else {
    tray = new Tray(nativcon);
  }

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: function() {
      win.show();
    }},
    { label: 'Exit', click: function() {
      app.quit();
    }}
  ]);

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/woleet-gui/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  tray.setToolTip('WoleetGui');
  tray.setContextMenu(contextMenu);

  win.on('minimize', () => {
    win.hide();
  });

  win.on('close', (event) => {
    if (willQuitApp) {
      win = null;
    } else {
      event.preventDefault();
      win.hide();
    }
  });
}

function setShortcuts() {
  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit();
  });
  globalShortcut.register('CommandOrControl+R', () => {
    win.reload();
  });
  globalShortcut.register('CommandOrControl+Alt+I', () => {
    win.webContents.openDevTools();
  });
  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectall' }
        ]
      }
    ]));
  }
}

app.on('ready', () => {
  createWindowTray();
  setShortcuts();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindowTray();
  } else {
    win.show();
  }
});

app.on('before-quit', () => {
  willQuitApp = true;
});
