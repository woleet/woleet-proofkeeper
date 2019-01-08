import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { tokenFormatValidator, noDuplicateIdentityNameValidatorFactory } from '../misc/validators';
import { checkAndSubmit } from '../misc/settingsChecker';
import { IdentityService } from '../services/Identity.service';
import { FoldersConfigService } from '../services/foldersConfig.service';
const { shell } = require('electron');



@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent {
  public screen: number[];
  public wizardTokenFromGroup: FormGroup;
  public wizardIdentityFromGroup: FormGroup;

  constructor(private dialogRef: MatDialogRef<WizardComponent>,
    private cli: WoleetCliParametersService,
    private formBuilder: FormBuilder,
    public identityService: IdentityService,
    private foldersConfigService: FoldersConfigService,
    private snackBar: MatSnackBar) {
      this.screen = [1];
      this.wizardTokenFromGroup = formBuilder.group({
        token: ['', [Validators.required, tokenFormatValidator]]
      });
      this.wizardIdentityFromGroup = formBuilder.group({
        name: ['', [Validators.required, noDuplicateIdentityNameValidatorFactory(this)]],
        url: ['', [Validators.required]],
        token: ['', [Validators.required]],
        pubKey: ['']
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
      this.identityService.addIdentity(
        this.wizardIdentityFromGroup.get('name').value,
        this.wizardIdentityFromGroup.get('url').value,
        this.wizardIdentityFromGroup.get('token').value,
        this.wizardIdentityFromGroup.get('pubKey').value);
        this.wizardIdentityFromGroup.reset();
      }

      closeDialog() {
        this.dialogRef.close();
      }
    }
