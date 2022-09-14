import { enable as enableRemote, initialize as initializeRemote } from '@electron/remote/main';
import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron';
import * as Store from 'electron-store';

import * as path from 'path';
import * as url from 'url';

initializeRemote();
Store.initRenderer();

let win, liveenv, tray, nativcon, splash;
let willQuitApp = false;

const args = process.argv.slice(1);
liveenv = args.some(val => val === '--liveenv');

declare var global: any;
global.liveenv = liveenv;

if (liveenv) {
  require('electron-reload')([__dirname + '/dist'], {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

// Force Single Instance Application
const gotTheLock = app.requestSingleInstanceLock();
if (gotTheLock) {
  app.on('second-instance', (e, argv) => {
    // Someone tried to run a second instance, we should focus our window.
    // Protocol handler for win32
    // argv: An array of the second instance’s (command line / deep linked) arguments
    if (process.platform === 'win32') {
      // Keep only command line / deep linked arguments
      const found = argv.find(elem => (elem.startsWith('proofkeeper://')));
      if (found) {
        sendDeepLink(found);
      }
    }

    if (win) {
      if (win.isMinimized()) {
         win.restore();
        }
      win.focus();
    }
  });
} else {
  app.quit();
}

nativcon = nativeImage.createFromPath(path.join(__dirname, 'dist/ProofKeeper/assets/images/woleet.png'));

function createWindowTray() {
  win = new BrowserWindow({
    width: 900,
    height: 800,
    minWidth: 400,
    minHeight: 300,
    icon: nativcon,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false
    }
  });

  // Create a splash
  splash = new BrowserWindow({
    width: 750,
    height: 543,
    minWidth: 400,
    minHeight: 290,
    transparent: true,
    frame: false
  });

  splash.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/ProofKeeper/assets/splash.html'),
    protocol: 'file:',
    slashes: true
  }));

  if (process.platform === 'darwin') {
    tray = new Tray(nativcon.resize({ width: 20, height: 20 }));
  } else {
    tray = new Tray(nativcon);
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show', click: function () {
        win.show();
      }
    },
    {
      label: 'Exit', click: function () {
        app.quit();
      }
    }
  ]);

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/ProofKeeper/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  tray.setToolTip('ProofKeeper');
  tray.setContextMenu(contextMenu);

  win.once('ready-to-show', () => {
    setTimeout(function(){
      splash.close();
      win.show();
    }, 1500);
  });


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
  enableRemote(win.webContents);
}


/**
* Get the OS language.
*/
function getOSLanguage(): string {
 const language = app.getLocale();
 if (language.split('-')[1]) {
   return language.split('-')[0]
 }
 return language;
}

/**
 * 
 * @returns 
 */
function getMenuTexts(): Electron.MenuItemConstructorOptions[] {
  if (getOSLanguage() === 'fr') {
    return [
      {
        label: 'Menu',
        submenu: [
          { role: 'undo', label: 'Annuler' },
          { role: 'redo', label: 'Refaire' },
          { type: 'separator' },
          { role: 'cut', label: 'Couper' },
          { role: 'copy', label: 'Copier' },
          { role: 'paste', label: 'Coller' },
          { role: 'selectAll', label: 'Sélectionner tout' },
          { type: 'separator' },
          { role: 'toggleDevTools', label: 'Ouvrir le débogueur' },
          { role: 'reload', label: 'Redémarrer' },
          { role: 'quit', label: 'Quitter' }
        ],
      }
    ];
  }
  return [
    {
      label: 'Menu',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { role: 'reload' },
        { role: 'quit' }
      ]
    }
  ];
}

function setShortcuts() {
  const menuTemplate: Electron.MenuItemConstructorOptions[] = getMenuTexts();

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.on('ready', () => {
  createWindowTray();
  setShortcuts();
});

app.on('will-finish-launching', function() {
  // Protocol handler for osx
  app.on('open-url', function(event, url) {
    event.preventDefault();
    sendDeepLink(url);
  });
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

if (!app.isDefaultProtocolClient('proofkeeper')) {
  // Define custom protocol handler. Deep linking works on packaged versions of the application!
  app.setAsDefaultProtocolClient('proofkeeper');
}

async function sendDeepLink(deeplinkingUrl) {
  if (process.platform !== 'darwin') {
    app.emit('activate');
  }
  await app.whenReady();
  win.webContents.send('deeplink', deeplinkingUrl);
}
