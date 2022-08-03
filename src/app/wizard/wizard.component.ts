import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PubKeyAddressGroup } from '../misc/identitiesFromServer';
import {
  checkAndSubmit,
  checkwIDConnectionGetAvailableKeys,
  storeManualActionsPath
} from '../misc/settingsChecker';
import {
  noDuplicateIdentityNameValidatorFactoryOnAdd,
  tokenFormatValidator
} from '../misc/validators';
import { IdentityService } from '../services/Identity.service';
import { SharedService } from '../services/shared.service';
import { StoreService } from '../services/store.service';
import { TranslationService } from '../services/translation.service';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
const { shell } = require('electron');

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
})
export class WizardComponent {
  public screen: number[]; // Used to pass the page number by reference
  public pubKeyAddressGroup: PubKeyAddressGroup[];
  public wizardTokenFormGroup: FormGroup;
  public wizardIdentityFormGroup: FormGroup;
  public wizardManualActionsDefaultPathsFormGroup: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<WizardComponent>,
    private cli: WoleetCliParametersService,
    private formBuilder: FormBuilder,
    public identityService: IdentityService,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    public translations: TranslationService,
    private storeService: StoreService,
    private sharedService: SharedService
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

    this.wizardManualActionsDefaultPathsFormGroup = this.formBuilder.group({
      manualTimestampingsPath: [
        this.storeService.getManualTimestampingsPath(),
        [Validators.required],
      ],
      manualSealsPath: [
        this.storeService.getManualSealsPath(),
        [Validators.required],
      ],
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

  saveDefaultPathsForm() {
    storeManualActionsPath(
      this.wizardManualActionsDefaultPathsFormGroup,
      this.storeService
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
    this.dialogRef.close();
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

  onPubKeyChange() {
    let replaceName = false;
    let newName = '';
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

  resetPath(type: string) {
    this.sharedService.resetPath(
      this.wizardManualActionsDefaultPathsFormGroup,
      type
    );
  }

  onClickPopUpDirectory(type: string) {
    this.sharedService.openPopupDirectory(
      this.wizardManualActionsDefaultPathsFormGroup,
      type,
      this.wizardManualActionsDefaultPathsFormGroup.get(type).value
    );
  }
}
