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


@Component({
  selector: 'app-wizard',
  templateUrl: './deeplink.component.html',
  styleUrls: ['./deeplink.component.scss']
})
export class DeeplinkComponent {

  public isApi = false;
  public isWids = false;
  public token: string;
  public url: string;
  public pubKeyAddressGroup: PubKeyAddressGroup[];
  public widsFormGroup: FormGroup;

  constructor(private dialogRef: MatDialogRef<DeeplinkComponent>,
    private formBuilder: FormBuilder,
    private cli: WoleetCliParametersService,
    public identityService: IdentityService,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.pubKeyAddressGroup = [];
    const deeplinkingUrl = new URL(data.url);
    this.checkParameters(deeplinkingUrl);
    if (this.isApi || this.isWids) {
      this.token = deeplinkingUrl.searchParams.get('token');
      if (deeplinkingUrl.searchParams.has('url')) {
        this.url = deeplinkingUrl.searchParams.get('url');
      }
      if (this.isWids) {
        this.widsFormGroup = formBuilder.group({
          name: ['', [Validators.required, noDuplicateIdentityNameValidatorFactoryOnAdd(this)]],
          pubKey: ['', [Validators.required]]
        });
      }
    }
  }

  checkParameters(deeplinkingUrl: URL) {
    if (deeplinkingUrl.protocol !== 'proofkeeper:') {
      return;
    }
    if (deeplinkingUrl.pathname.match(/\/+api\/*/i)) {
      if (!deeplinkingUrl.searchParams.has('token')) {
        return;
      }
      this.isApi = true;
      return;
    } else if (deeplinkingUrl.pathname.match(/\/+wids\/*/i)) {
      if (deeplinkingUrl.searchParams.has('token') && deeplinkingUrl.searchParams.has('url')) {
        this.isWids = true;
        return;
      }
      return;
    }
  }

  async onClickCheckwIDConnectionGetAvailableKeys() {
    await checkwIDConnectionGetAvailableKeys(this.http,
    this.url,
    this.token,
    this.pubKeyAddressGroup,
    this.snackBar);
    if (this.pubKeyAddressGroup.length === 0) {
      this.isWids = false;
    }
  }

  saveParameters() {
    if (this.isApi) {
      if (this.url) {
        this.cli.setWoleetCliParameters(this.token, this.url);
      } else {
        this.cli.setWoleetCliParameters(this.token, this.cli.getUrl());
      }
    }
    if (this.isWids) {
      this.identityService.addIdentity(
        this.widsFormGroup.get('name').value,
        this.url,
        this.token,
        this.widsFormGroup.get('pubKey').value);
      this.widsFormGroup.reset();
      while (this.pubKeyAddressGroup.length) {
        this.pubKeyAddressGroup.pop();
      }
    }
    this.dialogRef.close();
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
