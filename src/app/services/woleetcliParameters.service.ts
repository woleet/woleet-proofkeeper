import { Injectable } from '@angular/core';
import * as path from 'path';
import * as log from 'loglevel';
import * as fs from 'fs';
import * as store from 'electron-store';

@Injectable({
  providedIn: 'root',
})
export class WoleetCliParametersService {
  public woleetCli: WoleetCliExecutable = null;
  private url: string = null;
  private token: string = null;
  private persistentStorage: store;


  public getParametersAsString() {
    let globalParameters = '';
    if (this.url != null) {
      globalParameters = globalParameters.concat(`--url ${this.url} `);
    }
    if (this.token != null) {
      globalParameters = globalParameters.concat(`--token ${this.token} `);
    }
    return globalParameters;
  }

  public setWoleetCliParameters(token: string, url?: string) {
    this.token = token;
    this.persistentStorage.set('token', token);
    if (url !== undefined) {
      this.url = url;
      this.persistentStorage.set('url', url);
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
    this.persistentStorage.delete('url');
  }

  public deleteToken() {
    this.token = null;
    this.persistentStorage.delete('token');
  }

  public constructor() {
    this.woleetCli = new WoleetCliExecutable();
    this.persistentStorage = new store();
    if (store.has('token')) {
      this.token = store.get('token');
    } else {
      log.warn('There is no token set, you must set one to use the application');
    }
    if (store.has('url')) {
      this.url = store.get('url');
    }
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
