import { LogContext } from './logs';
import { FolderDesc } from '../services/foldersConfig.service';

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
  logContext?: LogContext;

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
    this.logContext = new LogContext();
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
