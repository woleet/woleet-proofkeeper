import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as log from 'loglevel';
import {
  PubKeyAddress,
  PubKeyAddressGroup
} from '../misc/identitiesFromServer';
import { checkwIDConnectionGetAvailableKeys } from '../misc/settingsChecker';
import { noDuplicateIdentityNameValidatorFactoryOnAdd } from '../misc/validators';
import { IdentityService } from '../services/Identity.service';
import { ToastService } from '../services/toast.service';
import { TranslationService } from '../services/translation.service';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';

@Component({
  selector: 'app-deeplink',
  templateUrl: './deeplink.component.html',
  styleUrls: ['./deeplink.component.scss'],
})
export class DeeplinkComponent implements OnInit {
  @Input() deeplinkingUrl: string;
  @Output() readonly exitDialog = new EventEmitter<boolean>();
  pubKeyAddressKey: string;

  public isApi = false;
  public isWids = false;
  public screen = 0;
  public woleetToken: string;
  public woleetUrl: string;
  public widsToken: string;
  public widsUrl: string;
  public pubKeyAddressGroup: PubKeyAddressGroup[] = [];
  public widsFormGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private cli: WoleetCliParametersService,
    public identityService: IdentityService,
    private http: HttpClient,
    public translations: TranslationService,
    private translateService: TranslateService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const deeplinkingUrl = new URL(this.deeplinkingUrl);
    this.checkParameters(deeplinkingUrl);
    if (this.isWids) {
      this.screen = 2;
      this.widsFormGroup = this.formBuilder.group({
        name: [
          '',
          [
            Validators.required,
            noDuplicateIdentityNameValidatorFactoryOnAdd(this),
          ],
        ],
        pubKey: ['', [Validators.required]],
      });
    }
    if (this.isApi) {
      this.screen = 1;
    }
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
      if (deeplinkingUrl.searchParams.has('url')) {
        this.woleetUrl = deeplinkingUrl.searchParams.get('woleeturl');
      }
      this.woleetToken = deeplinkingUrl.searchParams.get('token');
      this.isApi = true;
      return;
    } else if (deeplinkingUrl.pathname.match(/\/+wids\/*/i)) {
      if (
        deeplinkingUrl.searchParams.has('token') &&
        deeplinkingUrl.searchParams.has('url')
      ) {
        this.widsToken = deeplinkingUrl.searchParams.get('token');
        this.widsUrl = deeplinkingUrl.searchParams.get('url');
        this.isWids = true;
      }
      return;
    } else if (deeplinkingUrl.pathname.match(/\/+config\/*/i)) {
      if (deeplinkingUrl.searchParams.has('woleettoken')) {
        if (deeplinkingUrl.searchParams.has('woleeturl')) {
          this.woleetUrl = deeplinkingUrl.searchParams.get('woleeturl');
        }
        this.woleetToken = deeplinkingUrl.searchParams.get('woleettoken');
        this.isApi = true;
      }
      if (
        deeplinkingUrl.searchParams.has('widstoken') &&
        deeplinkingUrl.searchParams.has('widsurl')
      ) {
        this.widsToken = deeplinkingUrl.searchParams.get('widstoken');
        this.widsUrl = deeplinkingUrl.searchParams.get('widsurl');
        this.isWids = true;
      }
      return;
    }
  }

  async onClickCheckwIDConnectionGetAvailableKeys() {
    await checkwIDConnectionGetAvailableKeys(
      this.http,
      this.widsUrl,
      this.widsToken,
      this.pubKeyAddressGroup,
      this.toastService
    );
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
        this.widsFormGroup.get('pubKey').value
      );
      this.widsFormGroup.reset();
      while (this.pubKeyAddressGroup.length) {
        this.pubKeyAddressGroup.pop();
      }
    }
    this.exitDialog.emit(false);
  }

  nextScreen() {
    this.screen = this.screen + 1;
  }

  closeDialog() {
    this.exitDialog.emit(false);
  }

  getSelectedPubKeyName() {
    return this.identityService.getSelectedPubKeyName(
      this.widsFormGroup,
      this.pubKeyAddressKey
    );
  }

  onPubKeyChange(pubKeyAddress: PubKeyAddress) {
    this.pubKeyAddressKey = pubKeyAddress.key;
    this.identityService.onPubKeyChange(
      pubKeyAddress,
      this.widsFormGroup,
      this.pubKeyAddressGroup
    );
  }

  getButtonText(): string {
    if (this.screen === 0) {
      return this.translateService.instant(
        this.translations.commons.buttons.close
      );
    }
    if (
      (this.screen === 1 && !this.isWids) ||
      (this.screen === 2 && this.pubKeyAddressGroup.length !== 0)
    ) {
      return this.translateService.instant(
        this.translations.commons.buttons.save
      );
    }

    if (this.screen === 1 && this.isWids) {
      return this.translateService.instant(
        this.translations.commons.buttons.next
      );
    }

    if (this.screen === 2 && this.pubKeyAddressGroup.length === 0) {
      return this.translateService.instant(
        this.translations.commons.buttons.check
      );
    }
  }

  onButtonClick() {
    if (this.screen === 0) {
      this.closeDialog();
    }
    if (
      (this.screen === 1 && !this.isWids) ||
      (this.screen === 2 && this.pubKeyAddressGroup.length !== 0)
    ) {
      this.saveParameters();
      return;
    }

    if (this.screen === 1 && this.isWids) {
      this.nextScreen();
      return;
    }

    if (this.screen === 2 && this.pubKeyAddressGroup.length === 0) {
      this.onClickCheckwIDConnectionGetAvailableKeys();
      return;
    }
  }
}
