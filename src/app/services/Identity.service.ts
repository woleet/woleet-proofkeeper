import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import * as Store from 'electron-store';

interface IdentityContent {
  name: string;
  apiURL: string;
  apiToken: string;
  publicKey?: string;
}

@Injectable({ providedIn: 'root' })
export class IdentityService {
  private store: Store;
  public arrayIdentityContent: Array<IdentityContent>;

  public constructor(storeService: StoreService) {
    this.store = storeService.store;
    if (this.store.has('arrayIdentityContent')) {
      this.arrayIdentityContent = this.store.get('arrayIdentityContent');
    } else {
      this.arrayIdentityContent = new Array<IdentityContent>();
    }
  }

  public addIdentity(name: string, url: string, token: string, publicKey?: string) {
    this.addOrUpdateIdentity(false, name, url, token, publicKey);
  }

  public updateIdentity(name: string, url: string, token: string, publicKey?: string) {
    this.addOrUpdateIdentity(true, name, url, token, publicKey);
  }

  private addOrUpdateIdentity(update: boolean, name: string, url: string, token: string, publicKey?: string) {
    const tempIdentityContent: IdentityContent = {
      name: '',
      apiURL: '',
      apiToken: ''
    };
    tempIdentityContent.name = name;
    tempIdentityContent.apiURL = url;
    tempIdentityContent.apiToken = token;
    console.log(tempIdentityContent);
    if (publicKey) {
      tempIdentityContent.publicKey = publicKey;
    }
    if (!update && this.arrayIdentityContent.some(elem => elem.name === name)) {
      throw new Error (`Identity named ${name} already present`);
    }
    if (update && !this.arrayIdentityContent.some(elem => elem.name === name)) {
      throw new Error (`Identity named ${name} not found`);
    }
    this.arrayIdentityContent.push(tempIdentityContent);
    this.saveIdentities();
  }

  public deleteIdentity(identityName: string) {
    const found = this.arrayIdentityContent.filter(elem => elem.name !== name);
    if (this.arrayIdentityContent.some(elem => elem.name === identityName)) {
      this.arrayIdentityContent = this.arrayIdentityContent.filter(elem => elem.name !== name);
      this.saveIdentities();
    } else {
      throw new Error (`Identity named ${identityName} not found for deletion`);
    }
  }

  private saveIdentities() {
    this.store.set('arrayIdentityContent', this.arrayIdentityContent);
  }
}

