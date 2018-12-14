import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { WizardComponent } from '../wizard/wizard.component';



export function checkAndSubmit(formGroup: FormGroup,
                               cliService: WoleetCliParametersService,
                               snackBar: MatSnackBar,
                               dialogRef?: MatDialogRef<WizardComponent>) {
  let apiURL = `https://api.woleet.io/v1`;
  if (formGroup.get('url')) {
    apiURL = formGroup.get('url').value;
  }

  const req = new XMLHttpRequest();
  req.open('GET', `${apiURL}/user/credits`, true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.setRequestHeader('Authorization', `Bearer ${formGroup.get('token').value}`);
  req.timeout = 3000;
  req.ontimeout = () => {
    openSnackBarError(snackBar);
  };
  req.onload = () => {
    if (req.readyState === 4 ) {
      if (req.status === 200) {
        if (formGroup.get('url')) {
          cliService.setWoleetCliParameters(formGroup.get('token').value, formGroup.get('url').value);
        }
        cliService.setWoleetCliParameters(formGroup.get('token').value);
        if (dialogRef) {
          dialogRef.close();
        }
      } else {
        openSnackBarError(snackBar);
      }
    }
  };
  req.onerror = () => {
    openSnackBarError(snackBar);
  };
  req.send(null);
}

export function openSnackBarError(snackBar: MatSnackBar) {
  snackBar.open('Unable to login, please check your token',
  undefined,
  {duration: 3000});
}
