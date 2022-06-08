import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { IdentityService } from '../services/Identity.service';
import { noDuplicateIdentityNameValidatorFactoryOnAdd } from '../misc/validators';
import { checkwIDConnectionGetAvailableKeys } from '../misc/settingsChecker';
import { PubKeyAddressGroup } from '../misc/identitiesFromServer';
import * as log from 'loglevel';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from '../services/translation.service';


@Component({
  selector: 'app-wizard',
  templateUrl: './deeplink.component.html',
  styleUrls: ['./deeplink.component.scss']
})
export class DeeplinkComponent {

  public isApi = false;
  public isWids = false;
  public screen = 0;
  public woleetToken: string;
  public woleetUrl: string;
  public widsToken: string;
  public widsUrl: string;
  public pubKeyAddressGroup: PubKeyAddressGroup[];
  public widsFormGroup: FormGroup;

  constructor(private dialogRef: MatDialogRef<DeeplinkComponent>,
    private formBuilder: FormBuilder,
    private cli: WoleetCliParametersService,
    public identityService: IdentityService,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    public translations: TranslationService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.pubKeyAddressGroup = [];
    const deeplinkingUrl = new URL(data.url);
    this.checkParameters(deeplinkingUrl);
    if (this.isWids) {
      this.screen = 2;
      this.widsFormGroup = formBuilder.group({
        name: ['', [Validators.required, noDuplicateIdentityNameValidatorFactoryOnAdd(this)]],
        pubKey: ['', [Validators.required]]
      });
    }
    if (this.isApi) { this.screen = 1; }
  }

  checkParameters(deeplinkingUrl: URL) {
    log.info(`received ${deeplinkingUrl}`);
    if (deeplinkingUrl.protocol !== 'proofkeeper:') {
      return;
    }
    if (deeplinkingUrl.pathname.match(/\/+api\/*/i)) {
      if (!deeplinkingUrl.searchParams.has('token')) {
        return;
      }
      if (deeplinkingUrl.searchParams.has('url')) { this.woleetUrl = deeplinkingUrl.searchParams.get('woleeturl'); }
      this.woleetToken = deeplinkingUrl.searchParams.get('token');
      this.isApi = true;
      return;
    } else if (deeplinkingUrl.pathname.match(/\/+wids\/*/i)) {
      if (deeplinkingUrl.searchParams.has('token') && deeplinkingUrl.searchParams.has('url')) {
        this.widsToken = deeplinkingUrl.searchParams.get('token');
        this.widsUrl = deeplinkingUrl.searchParams.get('url');
        this.isWids = true;
      }
      return;
    } else if (deeplinkingUrl.pathname.match(/\/+config\/*/i)) {
      if (deeplinkingUrl.searchParams.has('woleettoken')) {
        if (deeplinkingUrl.searchParams.has('woleeturl')) { this.woleetUrl = deeplinkingUrl.searchParams.get('woleeturl'); }
        this.woleetToken = deeplinkingUrl.searchParams.get('woleettoken');
        this.isApi = true;
      }
      if (deeplinkingUrl.searchParams.has('widstoken') && deeplinkingUrl.searchParams.has('widsurl')) {
        this.widsToken = deeplinkingUrl.searchParams.get('widstoken');
        this.widsUrl = deeplinkingUrl.searchParams.get('widsurl');
        this.isWids = true;
      }
      return;
    }
  }

  async onClickCheckwIDConnectionGetAvailableKeys() {
    await checkwIDConnectionGetAvailableKeys(this.http,
    this.widsUrl,
    this.widsToken,
    this.pubKeyAddressGroup,
    this.snackBar);
  }

  saveParameters() {
    if (this.isApi) {
      if (this.woleetUrl) {
        this.cli.setWoleetCliParameters(this.woleetToken, this.woleetUrl);
      } else {
        this.cli.setWoleetCliParameters(this.woleetToken, this.cli.getUrl());
      }
    }
    if (this.isWids) {
      this.identityService.addIdentity(
        this.widsFormGroup.get('name').value,
        this.widsUrl,
        this.widsToken,
        this.widsFormGroup.get('pubKey').value);
      this.widsFormGroup.reset();
      while (this.pubKeyAddressGroup.length) {
        this.pubKeyAddressGroup.pop();
      }
    }
    this.dialogRef.close();
  }

  nextScreen() {
    this.screen = this.screen + 1;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onPubKeyChange() {
    let replaceName = false;
    let newName = '';
    if (!this.widsFormGroup.get('name').value) { replaceName = true; }
    if (this.pubKeyAddressGroup.length !== 0 && this.widsFormGroup.get('pubKey')) {
      this.pubKeyAddressGroup.forEach(pubKeyAddressGroup => {
        if (pubKeyAddressGroup.user === this.widsFormGroup.get('name').value) { replaceName = true; }
        pubKeyAddressGroup.pubKeyAddress.forEach(pubKeyAddress => {
          if (pubKeyAddress.address === this.widsFormGroup.get('pubKey').value) {
            newName = pubKeyAddressGroup.user;
          }
        });
      });
    }
    if (replaceName && newName) {
      this.widsFormGroup.patchValue({ name: newName });
    }
  }
}
