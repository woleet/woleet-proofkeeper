import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import { FolderParam } from '../misc/folderParam';
import { IdentityService } from './Identity.service';
import * as log from 'loglevel';
import * as Store from 'electron-store';

export interface FolderDesc {
  action: string;
  path: string;
  privateparam?: boolean;
  strict?: boolean;
  prune?: boolean;
  recursive?: boolean;
  identityName?: string;
  iDServerUnsecureSSL?: boolean;
}

@Injectable({
  providedIn: 'root',
})

export class FoldersConfigService {
  public folders: FolderParam[] = [];
  private store: Store;

  public constructor(storeService: StoreService, private identityService: IdentityService) {
    this.store = storeService.store;
    if (this.store.has('folders')) {
      const folders: FolderDesc[] = this.store.get('folders');
      this.folders = folders.map(e => new FolderParam(e, identityService));
    }
  }

  private addFolderFromClass(folder: FolderParam) {
    if (folder.action === 'anchor') {
      delete folder.identityName;
      delete folder.iDServerUnsecureSSL;
    }
    this.folders.push(folder);
    this.saveFolders();
  }

  public addFolderFromInterface(folderDesc: FolderDesc) {
    const newFolderParam = new FolderParam(folderDesc, this.identityService);
    this.addFolderFromClass(newFolderParam);
  }

  public deleteFolder(folder: FolderDesc) {
    const indexesOfFound: number[] = [];
    this.folders.forEach((elem, index) => {
      if ((folder.path === elem.path) && (folder.action === elem.action)) {
        indexesOfFound.push(index);
      }
    });
    if (indexesOfFound.length !== 1) {
      throw new Error ('Unable to find the folder to delete');
    } else {
      this.folders.splice(indexesOfFound[0], 1);
      this.saveFolders();
    }
  }

  public updateFolderOptions(folder: FolderDesc) {
    const found = this.folders.filter(elem => ((folder.path === elem.path) && (folder.action === elem.action)));
    if (found.length !== 1) {
      throw new Error ('Unable to find the folder to update');
    } else {
      found[0].private = folder.privateparam;
      found[0].strict = folder.strict;
      found[0].prune = folder.prune;
      found[0].recursive = folder.recursive;
      if (found[0].action === 'sign') {
        found[0].identityName = folder.identityName;
        found[0].iDServerUnsecureSSL = folder.iDServerUnsecureSSL;
      }
      this.saveFolders();
    }
  }

  public saveFolders() {
    const retFolderParam: any[] = [];
    this.folders.forEach(folder => {
      const tempfolder = ({ ...folder }); // Used to copy the object
      delete tempfolder.logContext;
      delete tempfolder.identityService;
      retFolderParam.push(tempfolder);
    });
    this.store.set('folders', retFolderParam);
  }
}
