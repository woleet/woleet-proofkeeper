import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import { FolderParam } from '../misc/folderParam';
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
    this.saveFolders();
  }

  public deleteFolder(folder: FolderParam) {
    const index = this.folders.lastIndexOf(folder);
    if (index === -1) {
      throw new Error ('Unable to find the folder to delete');
    } else {
      this.folders.splice(index, 1);
      this.saveFolders();
    }
  }

  private saveFolders() {
    const retFolderParam: any[] = [];
    this.folders.forEach(folder => {
      const tempfolder = ({ ...folder });
      delete tempfolder.logContext;
      retFolderParam.push(tempfolder);
    });
    this.store.set('folders', retFolderParam);
  }
}
