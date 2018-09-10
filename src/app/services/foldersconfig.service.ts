import { Injectable } from '@angular/core';
import * as log from 'loglevel'

Injectable({
  providedIn: 'root',
})
export class FoldersConfigService {
  
  private folders: folderParam[];

  getFolders(): folderParam[] {
    var foldersRet: folderParam[];
    this.folders.forEach(folderParam => {
      if ( ( folderParam.path != null ) && ( folderParam.action == ( 'anchor' || 'sign' ) ) ) {
        foldersRet.push(folderParam)
      }
      else {
        log.warn("Configuration of folder "+folderParam.path+" is invalid")
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
  backendkitSignURL: string = null;
  backendkitToken: string = null;
  backendkitUnsecureSSL: boolean = false;
  backendkitPubKey: string = null;

  public getParametersAsString() {
    let folderParameters: string = '';
    if (this.action != null){
      folderParameters = folderParameters.concat(`${this.action} `);
    }
    if (this.path != null){
      folderParameters = folderParameters.concat(`--directory ${this.path} `);
    }
    if (this.private != false){
      folderParameters = folderParameters.concat(`--private `);
    }     
    if (this.strict != false){
      folderParameters = folderParameters.concat(`--strict `);
    }    
    if (this.strictPrune != false){
      folderParameters = folderParameters.concat(`--strictPrune `);
    }
    if ((this.backendkitSignURL != null) && this.action == 'sign'){
      folderParameters = folderParameters.concat(`--backendkitSignURL ${this.backendkitSignURL} `);
    }
    if ((this.backendkitToken != null) && this.action == 'sign'){
      folderParameters = folderParameters.concat(`--backendkitToken ${this.backendkitToken} `);
    }    
    if ((this.backendkitUnsecureSSL != false) && this.action == 'sign'){
      folderParameters = folderParameters.concat(`--unsecureSSL `);
    }
    if ((this.backendkitPubKey != null) && this.action == 'sign'){
      folderParameters = folderParameters.concat(`--backendkitPubKey ${this.backendkitPubKey} `);
    }
    return folderParameters;
  }

  public constructor(action:string, path:string, privateparam?:boolean, strict?:boolean, strictPrune?:boolean, backendkitSignURL?:string, backendkitToken?:string, backendkitUnsecureSSL?:boolean, backendkitPubKey?:string) {
    if (action == ('anchor'||'sign')){
      this.action = action;
    } else {
      throw new Error(`Invalid action, must be anchor or sign current: ${action}`);
    }
    this.path = path;
    if (privateparam != undefined) {
      this.private = privateparam;
    }
    if (strict != undefined){
      this.strict = strict;
    }    
    if (strictPrune != undefined){
      this.strictPrune = strictPrune;
    }
    if (backendkitSignURL != undefined){
      this.backendkitSignURL = backendkitSignURL;
    }
    if (backendkitToken != undefined){
      this.backendkitToken = backendkitToken;
    }
    if (backendkitUnsecureSSL != undefined){
      this.backendkitUnsecureSSL = backendkitUnsecureSSL;
    }
    if (backendkitPubKey != undefined){
      this.backendkitPubKey = backendkitPubKey;
    }
  }

}