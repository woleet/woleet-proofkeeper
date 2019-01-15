import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { PubKeyAddressGroup } from './identitiesFromServer';
import * as log from 'loglevel';

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
    try {
      const creditsJSON = await requestGet(`${apiURL}/user/credits`, formGroup.get('token').value);
      try {
        const creditsObject = JSON.parse(<string>creditsJSON);
        if (creditsObject.credits === undefined)  { // TODO: check credits value
          openSnackBarError(snackBar);
          return;
        }
        if (apiURL === `https://api.woleet.io/v1`) {
        cliService.setWoleetCliParameters(formGroup.get('token').value);
      } else {
        cliService.setWoleetCliParameters(formGroup.get('token').value, formGroup.get('url').value);
      }
      if (screenPage) {
        screenPage[0] = screenPage[0] + 1;
      }
    } catch (e) {
      openSnackBarError(snackBar);
      return;
    }
  } catch (e) {
    openSnackBarError(snackBar);
    return;
  }
}

export async function checkwIDConnection(url: string,
  token: string,
  pubKeyAddressGroup: PubKeyAddressGroup[],
  snackBar: MatSnackBar) {
    while (pubKeyAddressGroup.length) {
      pubKeyAddressGroup.pop();
    }
    try {
      const usersJSON = await requestGet(`${url}/discover/users?search=%`, token);
      if (usersJSON) {
        try {
          const usersObject = JSON.parse(<string>usersJSON);
          for (const user of usersObject) {
            const currentPubKeyAddressGroup: PubKeyAddressGroup = {user: `${user.identity.commonName}`, pubKeyAddress: []};
            pubKeyAddressGroup.push(currentPubKeyAddressGroup);
            const currentUserKeysJSON = await requestGet(`${url}/discover/keys/${user.id}`, token);
            try {
              const currentUserKeysObject = JSON.parse(<string>currentUserKeysJSON);
              for (const key of currentUserKeysObject) {
                if (key.id === user.defaultKeyId) {
                  currentPubKeyAddressGroup.pubKeyAddress.unshift({key: `${key.name}`, address: `${key.pubKey}`});
                } else {
                  currentPubKeyAddressGroup.pubKeyAddress.push({key: `${key.name}`, address: `${key.pubKey}`});
                }
              }
            } catch (e) {
              openSnackBarErrowID(snackBar);
              while (pubKeyAddressGroup.length) {
                pubKeyAddressGroup.pop();
              }
              return;
            }
          }
        } catch (e) {
          openSnackBarErrowID(snackBar);
          while (pubKeyAddressGroup.length) {
            pubKeyAddressGroup.pop();
          }
          return;
        }
      }
    } catch (e) {
      openSnackBarErrowID(snackBar);
      while (pubKeyAddressGroup.length) {
        pubKeyAddressGroup.pop();
      }
      return;
    }
  }

  export async function checkPubKey (url: string, token: string, pubKey: string) {
    try {
      const userJSON = await requestGet(`${url}/discover/user/${pubKey}`, token);
      return true;
    } catch (e) {
      log.error(e);
      return false;
    }
  }

  export function openSnackBarError(snackBar: MatSnackBar) {
    snackBar.open('Unable to login. Please check your token.',
    undefined,
    {duration: 3000});
  }

  export function openSnackBarErrowID(snackBar: MatSnackBar) {
    snackBar.open('Unable to login, please check your url or token',
    undefined,
    {duration: 3000});
  }

  export async function requestGet (url: string, token: string) {
    return new Promise(function(resolve, reject) {
      const req = new XMLHttpRequest();
      req.open('GET', `${url}`, true);
      req.setRequestHeader('Content-Type', 'application/json');
      req.setRequestHeader('Authorization', `Bearer ${token}`);
      req.timeout = 3000;
      req.onload = () => {
        if (req.readyState === 4 ) {
          if (req.status === 200) {
            return resolve(req.response);
          } else {
            return reject();
          }
        }
      };
      req.onerror = () => {
        return reject();
      };
      req.ontimeout = () => {
        return reject();
      };
      req.send(null);
    });
  }



