import { FolderDesc } from '../services/foldersConfig.service';
import { IdentityService } from '../services/Identity.service';
import { LogContext } from './logs';

export class FolderParam {
  path: string;
  action: string;
  private: boolean;
  strict: boolean;
  prune: boolean;
  recursive: boolean;
  fixReceipts: boolean;
  filter: string;
  identityName: string;
  iDServerUnsecureSSL: boolean;
  logContext?: LogContext;
  receiptsDownloaded?: boolean;

  public constructor(folderDesc: FolderDesc, fixReceipts: boolean, public identityService: IdentityService) {
    if ((folderDesc.action === 'anchor') || (folderDesc.action === 'sign')) {
      this.action = folderDesc.action;
    } else {
      throw new Error(`Invalid action, must be anchor or sign current: ${folderDesc.action}`);
    }
    this.path = folderDesc.path;
    this.private = folderDesc.private;
    this.strict = folderDesc.strict;
    this.prune = folderDesc.prune;
    this.recursive = folderDesc.recursive;
    this.fixReceipts = fixReceipts;
    this.filter = folderDesc.filter;
    this.identityName = folderDesc.identityName;
    this.iDServerUnsecureSSL = folderDesc.iDServerUnsecureSSL;
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
    if (this.fixReceipts) {
      parametersArray.push('--fixReceipts');
    }
    if (this.filter) {
      parametersArray.push('--filter');
      parametersArray.push(this.filter);
    }
    if (this.identityName && this.action === 'sign') {
      if (this.identityService.arrayIdentityContent.filter(item => item.name === this.identityName).length !== 1) {
        throw new Error(`Unable to find the identity named: ${this.identityName}`);
      } else {
        const identity = this.identityService.arrayIdentityContent.filter(item => item.name === this.identityName)[0];
        parametersArray.push('--widsSignURL');
        parametersArray.push(`${identity.apiURL}`);
        parametersArray.push('--widsToken');
        parametersArray.push(identity.apiToken);
        if (identity.publicKey) {
          parametersArray.push('--widsPubKey');
          parametersArray.push(identity.publicKey);
        }
        if (this.iDServerUnsecureSSL) {
          parametersArray.push('--widsUnsecureSSL');
        }
      }
    }
    return parametersArray;
  }
}
