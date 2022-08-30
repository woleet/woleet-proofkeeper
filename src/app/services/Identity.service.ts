import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as Store from 'electron-store';
import {
  PubKeyAddress,
  PubKeyAddressGroup
} from '../misc/identitiesFromServer';
import { FoldersConfigService } from './foldersConfig.service';
import { StoreService } from './store.service';
import { TranslationService } from './translation.service';

export interface IdentityContent {
  name: string;
  apiURL: string;
  apiToken: string;
  publicKey?: string;
}

@Injectable({ providedIn: 'root' })
export class IdentityService {
  public store: Store<any>;
  public arrayIdentityContent: Array<IdentityContent>;

  public constructor(
    private storeService: StoreService,
    private translateService: TranslateService,
    private translations: TranslationService
  ) {
    this.store = storeService.store;
    if (this.store.has('arrayIdentityContent')) {
      this.arrayIdentityContent = this.store.get('arrayIdentityContent');
    } else {
      this.arrayIdentityContent = new Array<IdentityContent>();
    }
  }

  public addIdentity(
    name: string,
    url: string,
    token: string,
    publicKey?: string
  ) {
    const tempIdentityContent: IdentityContent = {
      name: '',
      apiURL: '',
      apiToken: '',
    };
    tempIdentityContent.name = name;
    tempIdentityContent.apiURL = url;
    tempIdentityContent.apiToken = token;
    if (publicKey) {
      tempIdentityContent.publicKey = publicKey;
    }
    if (this.arrayIdentityContent.some((elem) => elem.name === name)) {
      throw new Error(`Identity named ${name} already present`);
    }
    this.arrayIdentityContent.push(tempIdentityContent);
    this.saveIdentities();

    if (!this.store.has('defaultIdentity')) {
      this.storeService.setDefaultIdentity(name);
    }
  }

  public updateIdentity(
    foldersConfigService: FoldersConfigService,
    originalName: string,
    name: string,
    url: string,
    token: string,
    publicKey?: string
  ) {
    if (!this.arrayIdentityContent.some((elem) => elem.name === originalName)) {
      throw new Error(`Identity named ${name} not found`);
    }
    if (originalName === name) {
      const elementToUpdate = this.arrayIdentityContent.filter(
        (elem) => elem.name === originalName
      )[0];
      elementToUpdate.apiURL = url;
      elementToUpdate.apiToken = token;
      if (publicKey) {
        elementToUpdate.publicKey = publicKey;
      } else {
        delete elementToUpdate.publicKey;
      }
      this.saveIdentities();
    } else {
      this.addIdentity(name, url, token, publicKey);
      foldersConfigService.folders.forEach((folder) => {
        if (folder.identityName) {
          if (folder.identityName === originalName) {
            folder.identityName = name;
          }
        }
      });
      foldersConfigService.saveFolders();
      this.deleteIdentity(originalName);
    }
  }

  public deleteIdentity(identityName: string) {
    if (this.arrayIdentityContent.some((elem) => elem.name === identityName)) {
      this.arrayIdentityContent = this.arrayIdentityContent.filter(
        (elem) => elem.name !== identityName
      );
      this.saveIdentities();
    } else {
      throw new Error(`Identity named ${identityName} not found for deletion`);
    }
  }

  private saveIdentities() {
    this.store.set('arrayIdentityContent', this.arrayIdentityContent);
  }

  onPubKeyChange(
    pubKeyAddress: PubKeyAddress,
    form: FormGroup,
    pubKeyAddressGroup: Array<PubKeyAddressGroup>
  ) {
    let replaceName = false;
    let newName = '';
    form.get('pubKey').setValue(pubKeyAddress.address);

    if (!form.get('name').value) {
      replaceName = true;
    }
    if (pubKeyAddressGroup.length !== 0 && form.get('pubKey')) {
      pubKeyAddressGroup.forEach((pubKeyAddressGroup) => {
        if (pubKeyAddressGroup.user === form.get('name').value) {
          replaceName = true;
        }
        pubKeyAddressGroup.pubKeyAddress.forEach((pubKeyAddress) => {
          if (pubKeyAddress.address === form.get('pubKey').value) {
            newName = pubKeyAddressGroup.user;
          }
        });
      });
    }
    if (replaceName && newName) {
      form.patchValue({ name: newName });
    }
  }

  getSelectedPubKeyName(form: FormGroup, pubKeyAddressKey: string) {
    if (!form.get('pubKey').value) {
      return this.translateService.instant(
        this.translations.commons.labelNames.select
      );
    }
    return pubKeyAddressKey + ' - ' + form.get('pubKey').value;
  }

  getIdentityNames() {
    return this.arrayIdentityContent.map((identity) => identity.name);
  }

  errorOnSelectIdentity(form: FormGroup) {
    return (
      this.arrayIdentityContent.length === 0 ||
      (this.arrayIdentityContent.length !== 0 &&
        form.get('identity').getError('voidIdentity')) ||
      form.get('identity').getError('identityNotFound')
    );
  }

  errorTextOnSelectIdentity(form: FormGroup) {
    if (this.arrayIdentityContent.length === 0) {
      return this.translateService.instant(
        this.translations.folders.errors.addAtLeastOneIdentity
      );
    }

    if (
      this.arrayIdentityContent.length !== 0 &&
      form.get('identity').getError('voidIdentity')
    ) {
      return this.translateService.instant(
        this.translations.folders.errors.identityRequired
      );
    }

    if (form.get('identity').getError('identityNotFound')) {
      return this.translateService.instant(
        this.translations.folders.errors.notFound
      );
    }
  }
}
