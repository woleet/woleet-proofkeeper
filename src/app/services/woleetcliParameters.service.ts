import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import { FolderParam } from './foldersconfig.service';
import { remote } from 'electron';
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
  public store: Store;

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
  }

  public getActionParametersArray(folderParam: FolderParam): [string] {
    const actionParametersArray: [string] = [] as any;
    actionParametersArray.push(folderParam.action);
    if (this.url !== null) {
      actionParametersArray.push('--url');
      actionParametersArray.push(this.url);
    }
    if (this.token !== null) {
      actionParametersArray.push('--token');
      actionParametersArray.push(this.token);
    }
    return actionParametersArray.concat(folderParam.getParametersArray()) as any;
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

  public createProcess(parameters: [string]) {
    require('child_process').execFile(this.woleetCli, parameters, {stdio: 'pipe', windowsHide: true}, (error, stdout, stderr) => {
      if (error) {
        log.error(stderr);
      }
      log.info(stdout);
    });
  }

  public constructor() {
    let platform: string = process.platform;
    if ( platform === 'win32' ) {
      platform = 'windows';
    }
    this.woleetCli = path.join(__dirname, 'assets/bin/', platform, '/woleet-cli');
    if (fs.lstatSync(this.woleetCli).isFile()) {
      if (remote.getGlobal('liveenv')) {
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
      }
    } else {
      log.error(`Unable to find: ${this.woleetCli}`);
    }
  }
}
