import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { tokenFormatValidator, noDuplicateIdentityNameValidatorFactory } from '../misc/validators';
import { checkAndSubmit, checkwIDConnection } from '../misc/settingsChecker';
import { IdentityService } from '../services/Identity.service';
import { PubKeyAddressGroup } from '../misc/identitiesFromServer';
import log = require('loglevel');
const { shell } = require('electron');

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent {
  public screen: number[]; // Used to pass the page number by reference
  public pubKeyAddressGroup: PubKeyAddressGroup[];
  public wizardTokenFromGroup: FormGroup;
  public wizardIdentityFromGroup: FormGroup;

  constructor(private dialogRef: MatDialogRef<WizardComponent>,
    private cli: WoleetCliParametersService,
    private formBuilder: FormBuilder,
    public identityService: IdentityService,
    private snackBar: MatSnackBar) {
      this.screen = [1];
      this.pubKeyAddressGroup = [];
      this.wizardTokenFromGroup = formBuilder.group({
        token: ['', [Validators.required, tokenFormatValidator]]
      });
      this.wizardIdentityFromGroup = formBuilder.group({
        name: ['', [Validators.required, noDuplicateIdentityNameValidatorFactory(this)]],
        url: ['', [Validators.required]],
        token: ['', [Validators.required]],
        pubKey: ['', [Validators.required]]
      });
    }

    nextPage() {
      this.screen[0] = this.screen[0] + 1;
    }

    clickOnProofDesk() {
      shell.openExternal('https://app.woleet.io/account-settings#api');
    }

    saveTokenForm() {
      checkAndSubmit(this.wizardTokenFromGroup, this.cli, this.snackBar, this.screen);
    }

    saveIdentityForm() {
      const tempURL = this.wizardIdentityFromGroup.get('url').value;
      const tempToken = this.wizardIdentityFromGroup.get('token').value;
      this.identityService.addIdentity(
        this.wizardIdentityFromGroup.get('name').value,
        tempURL,
        tempToken,
        this.wizardIdentityFromGroup.get('pubKey').value);
      this.wizardIdentityFromGroup.reset();
      this.wizardIdentityFromGroup.patchValue({url: tempURL});
      this.wizardIdentityFromGroup.patchValue({token: tempToken});
      while (this.pubKeyAddressGroup.length) {
        this.pubKeyAddressGroup.pop();
      }
      }

      closeDialog() {
        this.dialogRef.close();
      }

      onClickCheckwIDConnection() {
        checkwIDConnection(this.wizardIdentityFromGroup.get('url').value,
        this.wizardIdentityFromGroup.get('token').value,
        this.pubKeyAddressGroup,
        this.snackBar);
      }

      onURLTokenChanges() {
        this.pubKeyAddressGroup = [];
      }
    }

