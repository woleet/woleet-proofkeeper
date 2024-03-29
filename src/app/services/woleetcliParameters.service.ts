import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import * as Store from 'electron-store';
import * as fs from 'fs';
import * as log from 'loglevel';
import * as path from 'path';
import { environment } from '../../environments/environment';
import { FolderParam } from '../misc/folderParam';
import { getDefaultApiUrl } from './shared.service';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root',
})
export class WoleetCliParametersService {
  public woleetCli: WoleetCliExecutable;
  private url: string;
  private token: string;
  public store: Store<any>;

  public constructor(storeService: StoreService) {
    this.store = storeService.store;
    this.woleetCli = new WoleetCliExecutable();
    if (this.store.has('token')) {
      if (this.store.get('token')) {
        this.token = this.store.get('token');
      } else {
        this.deleteToken();
        log.warn(
          'There is no token set, you must set one to use the application'
        );
      }
    } else {
      log.warn(
        'There is no token set, you must set one to use the application'
      );
    }
    if (this.store.has('url')) {
      if (this.store.get('url')) {
        this.url = this.store.get('url');
      } else {
        this.deleteUrl();
      }
    }
  }

  public getActionParametersArray(folderParam: FolderParam): [string] {
    const actionParametersArray: [string] = [] as any;
    if (folderParam.action === 'anchor') {
      actionParametersArray.push('timestamp');
    }
    if (folderParam.action === 'sign') {
      actionParametersArray.push('seal');
    }
    actionParametersArray.push('--config');
    actionParametersArray.push('DISABLED');
    actionParametersArray.push('--json');
    if (this.url) {
      actionParametersArray.push('--url');
      actionParametersArray.push(this.url);
    } else if (!environment.production && !this.url) {
      // For local mode, add url parameter too
      actionParametersArray.push('--url');
      actionParametersArray.push(getDefaultApiUrl());
    }
    if (this.token) {
      actionParametersArray.push('--token');
      actionParametersArray.push(this.token);
    }
    return actionParametersArray.concat(
      folderParam.getParametersArray()
    ) as any;
  }

  public setWoleetCliParameters(token: string, url?: string) {
    if (token) {
      this.token = token;
      this.store.set('token', token);
    } else {
      this.deleteToken();
    }
    if (url) {
      this.url = url;
      this.store.set('url', url);
    } else {
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

  public createProcess(parameters: [string]): any {
    return require('child_process').spawn(this.woleetCli, parameters, {
      stdio: 'pipe',
      windowsHide: true,
    });
  }

  public constructor() {
    const platform: string = process.platform;
    if (platform === 'win32') {
      this.woleetCli = path.join(
        __dirname,
        '/assets/bin/',
        'windows',
        '/woleet-cli.exe'
      );
    } else {
      this.woleetCli = path.join(
        __dirname,
        '/assets/bin/',
        platform,
        '/woleet-cli'
      );
    }
    if (this.woleetCli.includes('app.asar')) {
      this.woleetCli = this.woleetCli.replace('app.asar', 'app.asar.unpacked');
    }

    if (fs.lstatSync(this.woleetCli).isFile()) {
      if (remote.getGlobal('liveenv')) {
        if (platform !== 'windows') {
          let executable = true;
          try {
            fs.accessSync(this.woleetCli, fs.constants.X_OK);
          } catch (err) {
            executable = false;
          }
          if (!executable) {
            // tslint:disable-next-line:no-bitwise
            fs.chmodSync(
              this.woleetCli,
              fs.lstatSync(this.woleetCli).mode | fs.constants.S_IXUSR
            );
          }
        }
      }
    } else {
      log.error(`Unable to find: ${this.woleetCli}`);
    }
  }
}
