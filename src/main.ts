import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { remote } from 'electron';
import * as log from 'loglevel';
import 'hammerjs';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

if (remote.getGlobal('liveenv')) {
  log.setLevel('debug');
} else {
  log.setLevel('info');
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
