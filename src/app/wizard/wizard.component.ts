import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import {
  PubKeyAddress,
  PubKeyAddressGroup
} from '../misc/identitiesFromServer';
import {
  checkAndSubmit,
  checkwIDConnectionGetAvailableKeys
} from '../misc/settingsChecker';
import {
  noDuplicateIdentityNameValidatorFactoryOnAdd,
  tokenFormatValidator
} from '../misc/validators';
import { IdentityService } from '../services/Identity.service';
import { TranslationService } from '../services/translation.service';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
const { shell } = require('electron');

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
})
export class WizardComponent {
  @Output() readonly exitDialog = new EventEmitter<boolean>();

  public screen: number[]; // Used to pass the page number by reference
  public pubKeyAddressGroup: PubKeyAddressGroup[];
  public wizardTokenFormGroup: FormGroup;
  public wizardIdentityFormGroup: FormGroup;
  pubKeyAddressKey: string;

  constructor(
    private cli: WoleetCliParametersService,
    private formBuilder: FormBuilder,
    public identityService: IdentityService,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    public translations: TranslationService,
    private translateService: TranslateService
  ) {
    this.screen = [1];
    this.pubKeyAddressGroup = [];
    this.wizardTokenFormGroup = this.formBuilder.group({
      token: ['', [Validators.required, tokenFormatValidator]],
    });
    this.wizardIdentityFormGroup = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          noDuplicateIdentityNameValidatorFactoryOnAdd(this),
        ],
      ],
      url: ['', [Validators.required]],
      token: ['', [Validators.required]],
      pubKey: ['', [Validators.required]],
    });
  }

  nextPage() {
    this.screen[0] = this.screen[0] + 1;
  }

  clickOnDashboard() {
    shell.openExternal('https://dashboard.woleet.io/security');
  }

  saveTokenForm() {
    checkAndSubmit(
      this.http,
      this.wizardTokenFormGroup,
      this.cli,
      this.snackBar,
      this.screen
    );
  }

  saveIdentityForm() {
    const tempURL = this.wizardIdentityFormGroup.get('url').value;
    const tempToken = this.wizardIdentityFormGroup.get('token').value;
    this.identityService.addIdentity(
      this.wizardIdentityFormGroup.get('name').value,
      tempURL,
      tempToken,
      this.wizardIdentityFormGroup.get('pubKey').value
    );
    this.wizardIdentityFormGroup.reset();
    this.wizardIdentityFormGroup.patchValue({ url: tempURL });
    this.wizardIdentityFormGroup.patchValue({ token: tempToken });
    while (this.pubKeyAddressGroup.length) {
      this.pubKeyAddressGroup.pop();
    }
  }

  closeDialog() {
    this.exitDialog.emit(false);
  }

  onClickCheckwIDConnectionGetAvailableKeys() {
    checkwIDConnectionGetAvailableKeys(
      this.http,
      this.wizardIdentityFormGroup.get('url').value,
      this.wizardIdentityFormGroup.get('token').value,
      this.pubKeyAddressGroup,
      this.snackBar
    );
  }

  onURLTokenChanges() {
    this.pubKeyAddressGroup = [];
  }

  getSelectedPubKeyName() {
    if (!this.wizardIdentityFormGroup.get('pubKey').value) {
      return this.translateService.instant(
        this.translations.commons.labelNames.select
      );
    }
    return (
      this.pubKeyAddressKey +
      ' - ' +
      this.wizardIdentityFormGroup.get('pubKey').value
    );
  }

  onPubKeyChange(pubKeyAddress: PubKeyAddress) {
    let replaceName = false;
    let newName = '';
    this.wizardIdentityFormGroup.get('pubKey').setValue(pubKeyAddress.address);
    this.pubKeyAddressKey = pubKeyAddress.key;

    if (!this.wizardIdentityFormGroup.get('name').value) {
      replaceName = true;
    }
    if (
      this.pubKeyAddressGroup.length !== 0 &&
      this.wizardIdentityFormGroup.get('pubKey')
    ) {
      this.pubKeyAddressGroup.forEach((pubKeyAddressGroup) => {
        if (
          pubKeyAddressGroup.user ===
          this.wizardIdentityFormGroup.get('name').value
        ) {
          replaceName = true;
        }
        pubKeyAddressGroup.pubKeyAddress.forEach((pubKeyAddress) => {
          if (
            pubKeyAddress.address ===
            this.wizardIdentityFormGroup.get('pubKey').value
          ) {
            newName = pubKeyAddressGroup.user;
          }
        });
      });
    }
    if (replaceName && newName) {
      this.wizardIdentityFormGroup.patchValue({ name: newName });
    }
  }

  getButtonText(): string {
    if (this.screen[0] === 1) {
      return this.translateService.instant(
        this.translations.wizard.startConfig
      );
    }

    if (this.screen[0] === 2 || this.screen[0] === 3) {
      return this.translateService.instant(
        this.translations.commons.buttons.next
      );
    }

    if (this.screen[0] === 4) {
      return 'OK';
    }
  }

  onButtonClick() {
    if (this.screen[0] === 1) {
      this.nextPage();
      return;
    }

    if (this.screen[0] === 2) {
      this.saveTokenForm();
      return;
    }

    if (this.screen[0] === 3) {
      this.saveIdentityForm();
      this.nextPage();
      return;
    }

    if (this.screen[0] === 4) {
      this.closeDialog();
    }
  }
}
