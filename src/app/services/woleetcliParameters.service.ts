import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import * as path from 'path';
import * as log from 'loglevel';
import * as fs from 'fs';
import * as Store from 'electron-store';

@Injectable({
  providedIn: 'root',
})

export class WoleetCliParametersService {
  public woleetCli: WoleetCliExecutable = null;
  private url: string = null;
  private token: string = null;
  private store: Store;

  public constructor(storeService: StoreService) {
    this.store = storeService.store;
    this.woleetCli = new WoleetCliExecutable();
    if (this.store.has('token')) {
      this.token = this.store.get('token');
    } else {
      log.warn('There is no token set, you must set one to use the application');
    }
    if (this.store.has('url')) {
      this.url = this.store.get('url');
    }
    log.info('FoldersCli ' + this.token);
  }

  public getParametersAsString() {
    let globalParameters = '';
    if (this.url !== null) {
      globalParameters = globalParameters.concat(`--url ${this.url} `);
    }
    if (this.token !== null) {
      globalParameters = globalParameters.concat(`--token ${this.token} `);
    }
    return globalParameters;
  }

  public setWoleetCliParameters(token: string, url?: string) {
    this.token = token;
    this.store.set('token', token);
    if (url) {
      this.url = url;
      this.store.set('url', url);
    }
    if (url === null ) {
      this.deleteUrl();
    }
  }

  public getUrl(): string {
    return this.url;
  }

  public getToken(): string {
    return this.token;
  }

  public deleteUrl() {
    this.url = null;
    this.store.delete('url');
  }

  public deleteToken() {
    this.token = null;
    this.store.delete('token');
  }
}

export class WoleetCliExecutable {

  private woleetCli: string;

  public getCliPath() {
    return this.woleetCli;
  }

  public createProcess(parameters: string): string {
    let out: string;
    try {
      out = require('child_process').execFileSync(this.woleetCli, [parameters], {stdio: 'pipe', windowsHide: true});
    } catch (error) {
      log.error(error);
      out = error;
    }
    return out;
  }

  public constructor() {
    let platform: string = process.platform;
    if ( platform === 'win32' ) {
      platform = 'windows';
    }
    this.woleetCli = path.join(__dirname, 'assets/bin/', platform, '/woleet-cli');
    if (fs.lstatSync(this.woleetCli).isFile()) {
      if ( platform !== 'windows' ) {
        let executable = true;
        try {
          fs.accessSync(this.woleetCli, fs.constants.X_OK);
        } catch (err) {
          executable = false;
        }
        if (!executable) {
          // tslint:disable-next-line:no-bitwise
          fs.chmodSync(this.woleetCli, fs.lstatSync(this.woleetCli).mode | fs.constants.S_IXUSR);
        }
      }
    } else {
      log.error(`Unable to find: ${this.woleetCli}`);
    }
  }
}
