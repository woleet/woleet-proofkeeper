import { LogContext } from './logs';
import { FolderDesc } from '../services/foldersConfig.service';
import { IdentityService } from '../services/Identity.service';

export class FolderParam {
  path: string;
  action: string;
  private?: boolean;
  strict?: boolean;
  prune?: boolean;
  recursive?: boolean;
  identityName?: string;
  iDServerUnsecureSSL?: boolean;
  logContext?: LogContext;

  public constructor(folderDesc: FolderDesc, public identityService: IdentityService) {
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
    if (folderDesc.identityName) {
      this.identityName = folderDesc.identityName;
    }
    if (folderDesc.iDServerUnsecureSSL) {
      this.iDServerUnsecureSSL = folderDesc.iDServerUnsecureSSL;
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
    if (this.identityName && this.action === 'sign') {
      if (this.identityService.arrayIdentityContent.filter(item => item.name === this.identityName).length !== 1) {
        throw new Error(`Unable to find the identity named: ${this.identityName}`);
      } else {
        const identity = this.identityService.arrayIdentityContent.filter(item => item.name === this.identityName)[0];
        parametersArray.push('--widsSignURL');
        parametersArray.push(identity.apiURL);
        parametersArray.push('--widsToken');
        parametersArray.push(identity.apiToken);
        if (identity.publicKey) {
          parametersArray.push('--widsPubKey');
          parametersArray.push(identity.publicKey);
        }
        if (this.action === 'sign') {
          parametersArray.push('--widsUnsecureSSL');
        }
      }
    }
    return parametersArray;
  }
}
