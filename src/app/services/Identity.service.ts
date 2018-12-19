import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import * as Store from 'electron-store';

export interface IdentityContent {
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
    const tempIdentityContent: IdentityContent = {
      name: '',
      apiURL: '',
      apiToken: ''
    };
    tempIdentityContent.name = name;
    tempIdentityContent.apiURL = url;
    tempIdentityContent.apiToken = token;
    if (publicKey) {
      tempIdentityContent.publicKey = publicKey;
    }
    if (this.arrayIdentityContent.some(elem => elem.name === name)) {
      throw new Error (`Identity named ${name} already present`);
    }
    this.arrayIdentityContent.push(tempIdentityContent);
    this.saveIdentities();
  }

  public updateIdentity(originalName: string, name: string, url: string, token: string, publicKey?: string) {
    if (!this.arrayIdentityContent.some(elem => elem.name === originalName)) {
      throw new Error (`Identity named ${name} not found`);
    }
    if (originalName === name) {
      const elementToUpdate = this.arrayIdentityContent.filter(elem => elem.name === originalName)[0];
      elementToUpdate.apiURL = url;
      elementToUpdate.apiToken = token;
      if (publicKey) {
        elementToUpdate.publicKey = publicKey;
      }
      this.saveIdentities();
    } else {
      this.addIdentity(name, url, token, publicKey);
      this.deleteIdentity(originalName);
    }
  }

    public deleteIdentity(identityName: string) {
      if (this.arrayIdentityContent.some(elem => elem.name === identityName)) {
        this.arrayIdentityContent = this.arrayIdentityContent.filter(elem => elem.name !== identityName);
        this.saveIdentities();
      } else {
        throw new Error (`Identity named ${identityName} not found for deletion`);
      }
    }

    private saveIdentities() {
      this.store.set('arrayIdentityContent', this.arrayIdentityContent);
    }
  }


