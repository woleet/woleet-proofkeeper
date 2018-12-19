import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Validators, AbstractControl, FormGroup, FormBuilder, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { tokenFormatValidator } from '../misc/validators';
import { checkAndSubmit } from '../misc/settingsChecker';
const { shell } = require('electron');



@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent {
  public firstScreen: boolean;
  public wizardFromGroup: FormGroup;

  constructor(private dialogRef: MatDialogRef<WizardComponent>,
    private cli: WoleetCliParametersService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar) {
      this.firstScreen = true;
      this.wizardFromGroup = formBuilder.group({
        token: ['', [Validators.required, tokenFormatValidator]]
      });
    }

    clickOnProofDesk() {
      shell.openExternal('https://app.woleet.io/account-settings#api');
    }

    onClickcheckAndSubmit() {
      checkAndSubmit(this.wizardFromGroup, this.cli, this.snackBar, this.dialogRef);
    }

    closeDialog() {
      this.dialogRef.close();
    }
  }

