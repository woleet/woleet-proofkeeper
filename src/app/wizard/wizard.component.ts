import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Validators, AbstractControl, FormGroup, FormBuilder, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';


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
    public snackBar: MatSnackBar) {
      this.firstScreen = true;
      this.wizardFromGroup = formBuilder.group({
        token: ['', [Validators.required, this.tokenFormatValidator]],
        domain: ['', [Validators.pattern('[a-z]+')]],
      });
    }

    async onClickSubmit() {
      let apiURL = `https://api.woleet.io/v1`;
      if (this.wizardFromGroup.get('domain').value) {
        apiURL = `https://${this.wizardFromGroup.get('domain').value}.woleet.io/api`;
      }

      const req = new XMLHttpRequest();
      req.open('GET', `${apiURL}/user/credits`, true);
      req.setRequestHeader('Content-Type', 'application/json');
      req.setRequestHeader('Authorization', `Bearer ${this.wizardFromGroup.get('token').value}`);
      req.timeout = 3000;
      req.ontimeout = () => {
        this.openSnackBarError();
      };
      req.onload = () => {
        if (req.readyState === 4 ) {
          if (req.status === 200) {
            this.setCliParametersAndClose(apiURL);
            this.closeDialog();
          } else {
            this.openSnackBarError();
          }
        }
      };
      req.onerror = () => {
        this.openSnackBarError();
      };
      req.send(null);
    }

    openSnackBarError() {
      this.snackBar.open('Unable to login, please check your token or domain (if any)',
      undefined,
      {duration: 3000});
    }

    setCliParametersAndClose (apiURL: string) {
      if (this.wizardFromGroup.get('domain').value) {
        this.cli.setWoleetCliParameters(this.wizardFromGroup.get('token').value, apiURL);
      } else {
        this.cli.setWoleetCliParameters(this.wizardFromGroup.get('token').value);
      }
      this.closeDialog();
    }

    closeDialog() {
      this.dialogRef.close();
    }

    tokenFormatValidator(control: AbstractControl): ValidationErrors | null {
      if (!control.value) {
        return null;
      }
      if ((control.value.match(/\./g) || []).length !== 2) {
        return {invalidJWTFormat: true};
      }
      const base64 = control.value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      try {
        const jwtObject = JSON.parse(atob(base64));
        if ( jwtObject.hasOwnProperty('sub') && jwtObject.hasOwnProperty('iat') ) {
          return null;
        }
      } catch {
        return {invalidJWTFormat: true};
      }
      return {invalidJWTFormat: true};
    }
  }

