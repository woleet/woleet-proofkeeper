import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import * as log from 'loglevel';
import * as Store from 'electron-store';

export interface FolderDesc {
  action: string;
  path: string;
  privateparam?: boolean;
  strict?: boolean;
  prune?: boolean;
  recursive?: boolean;
  iDServerSignURL?: string;
  iDServerToken?: string;
  iDServerUnsecureSSL?: boolean;
  iDServerPubKey?: string;
}

@Injectable({
  providedIn: 'root',
})

export class FoldersConfigService {
  public folders: FolderParam[] = [];
  private store: Store;

  public constructor(storeService: StoreService) {
    this.store = storeService.store;
    if (this.store.has('folders')) {
      const folders: FolderDesc[] = this.store.get('folders');
      this.folders = folders.map(e => new FolderParam(e));
    }
  }

  public getFoldersPruned(): FolderParam[] {
    const foldersRet: FolderParam[] = [];
    this.folders.forEach(folderParam => {
      if ( ( folderParam.path != null ) && ( folderParam.action === ( 'anchor' || 'sign' ) ) ) {
        foldersRet.push(folderParam);
      } else {
        log.warn('Configuration of folder ' + folderParam.path + ' is invalid');
      }
    });
    return foldersRet;
  }

  public addFolderFromInterface(folderDesc: FolderDesc) {
    const newFolderParam = new FolderParam(folderDesc);
    this.addFolderFromClass(newFolderParam);
  }

  public addFolderFromClass(folder: FolderParam) {
    if (folder.action === 'anchor') {
      delete folder.iDServerSignURL;
      delete folder.iDServerToken;
      delete folder.iDServerUnsecureSSL;
      delete folder.iDServerPubKey;
    }
    this.folders.push(folder);
    this.saveFolder();
  }

  public deleteFolder(folder: FolderParam) {
    const index = this.folders.lastIndexOf(folder);
    if (index === -1) {
      throw new Error ('Unable to find the folder to delete');
    } else {
      this.folders.splice(index, 1);
      this.saveFolder();
    }
  }

  private saveFolder() {
    const retFolderParam: any[] = [];
    this.folders.forEach(folder => {
      const tempfolder = ({ ...folder });
      delete tempfolder.logs;
      retFolderParam.push(tempfolder);
    });
    this.store.set('folders', retFolderParam);
  }
}

export interface Log {
  level: string;
  msg: string;
}

export class FolderParam {
  path: string;
  action: string;
  private?: boolean;
  strict?: boolean;
  prune?: boolean;
  recursive?: boolean;
  iDServerSignURL?: string;
  iDServerToken?: string;
  iDServerUnsecureSSL?: boolean;
  iDServerPubKey?: string;
  logs?: Log[];

  public constructor(folderDesc: FolderDesc) {
    if ((folderDesc.action === 'anchor') || (folderDesc.action === 'sign')) {
      this.action = folderDesc.action;
    } else {
      throw new Error(`Invalid action, must be anchor or sign current: ${folderDesc.action}`);
    }
    if (folderDesc.path) {
      this.path = folderDesc.path;
    } else {
      throw new Error(`path can't be null / undefined`);
    }
    if (folderDesc.privateparam) {
      this.private = folderDesc.privateparam;
    }
    if (folderDesc.strict) {
      this.strict = folderDesc.strict;
    }
    if (folderDesc.prune) {
      this.prune = folderDesc.prune;
    }
    if (folderDesc.recursive) {
      this.recursive = folderDesc.recursive;
    }
    if (folderDesc.iDServerSignURL) {
      this.iDServerSignURL = folderDesc.iDServerSignURL;
    }
    if (folderDesc.iDServerToken) {
      this.iDServerToken = folderDesc.iDServerToken;
    }
    if (folderDesc.iDServerUnsecureSSL) {
      this.iDServerUnsecureSSL = folderDesc.iDServerUnsecureSSL;
    }
    if (folderDesc.iDServerPubKey) {
      this.iDServerPubKey = folderDesc.iDServerPubKey;
    }
  }

  public getParametersArray(): [string] {
    const parametersArray: [string] = [] as any;
    if (this.path) {
      parametersArray.push('--directory');
      parametersArray.push(this.path);
    }
    if (this.private) {
      parametersArray.push('--private');
    }
    if (this.strict) {
      parametersArray.push('--strict');
    }
    if (this.prune) {
      parametersArray.push('--prune');
    }
    if (this.recursive) {
      parametersArray.push('--recursive');
    }
    if (this.iDServerSignURL && this.action === 'sign') {
      parametersArray.push('--widsSignURL');
      parametersArray.push(this.iDServerSignURL);
    }
    if (this.iDServerToken && this.action === 'sign') {
      parametersArray.push('--widsToken');
      parametersArray.push(this.iDServerToken);
    }
    if (this.iDServerUnsecureSSL && this.action === 'sign') {
      parametersArray.push('--widsUnsecureSSL');
    }
    if (this.iDServerPubKey && this.action === 'sign') {
      parametersArray.push('--widsPubKey');
      parametersArray.push(this.iDServerPubKey);
    }
    return parametersArray;
  }
}

