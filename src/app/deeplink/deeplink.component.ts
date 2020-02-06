import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA  } from '@angular/material';
import { MatDialogRef } from '@angular/material/dialog';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { IdentityService } from '../services/Identity.service';
import * as log from 'loglevel';

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

  constructor(private dialogRef: MatDialogRef<DeeplinkComponent>,
    private cli: WoleetCliParametersService,
    public identityService: IdentityService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    const deeplinkingUrl = new URL(data.url);
    this.checkParameters(deeplinkingUrl);
    if (this.isApi || this.isWids) {
      this.token = deeplinkingUrl.searchParams.get('token');
      if (deeplinkingUrl.searchParams.has('url')) {
        this.url = deeplinkingUrl.searchParams.get('url');
      }
    }
  }

  checkParameters(deeplinkingUrl: URL) {
    if (deeplinkingUrl.protocol !== 'proofkeeper:') {
      return;
    }
    if (deeplinkingUrl.pathname === '//api') {
      if (!deeplinkingUrl.searchParams.has('token') && deeplinkingUrl.searchParams.has('url')) {
        return;
      }
      this.isApi = true;
      return;
    } else if (deeplinkingUrl.pathname === '//wids') {
      if (!deeplinkingUrl.searchParams.has('token') && deeplinkingUrl.searchParams.has('url')) {
        return;
      }
      this.isWids = true;
      return;
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

    }
    this.dialogRef.close();
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
