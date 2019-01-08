import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';



export async function checkAndSubmit(formGroup: FormGroup,
  cliService: WoleetCliParametersService,
  snackBar: MatSnackBar,
  screenPage?: number[]) {
    let apiURL = `https://api.woleet.io/v1`;
    if (formGroup.get('url')) {
      if (formGroup.get('url').value) {
        apiURL = formGroup.get('url').value;
      }
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
            if (formGroup.get('url').value) {
              cliService.setWoleetCliParameters(formGroup.get('token').value, formGroup.get('url').value);
            } else {
              cliService.setWoleetCliParameters(formGroup.get('token').value);
            }
          } else {
            cliService.setWoleetCliParameters(formGroup.get('token').value);
          }
          if (screenPage) {
            screenPage[0] = screenPage[0] + 1;
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
