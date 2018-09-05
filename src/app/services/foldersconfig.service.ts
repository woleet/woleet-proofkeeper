import { Injectable } from '@angular/core';

Injectable({
  providedIn: 'root',
})
export class FoldersConfigService {

  private folders: folderParam[];

  getFolders(): folderParam[] {
    var foldersRet: folderParam[];
    this.folders.forEach(folderParam => {
      if ( (folderParam.path != null) && ( folderParam.action == ( 'anchor' || 'sign' ) ) ) {
        foldersRet.push(folderParam)
      }
      else {

      }
    });
    return foldersRet;
  }

  public constructor() { }
}

class folderParam {
  path: string = null;
  action: string = null;
  private: boolean = false;
  strict: boolean = false;
  strictPrune: boolean = false;
  backendkitPubKey: string = null;
}