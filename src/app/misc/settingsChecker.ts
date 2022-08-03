import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { AppInjector } from '../app.module';
import { SharedService } from '../services/shared.service';
import { StoreService } from '../services/store.service';
import { TranslationService } from '../services/translation.service';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { PubKeyAddressGroup } from './identitiesFromServer';

export async function checkAndSubmit(
  http: HttpClient,
  formGroup: FormGroup,
  cliService: WoleetCliParametersService,
  snackBar: MatSnackBar,
  screenPage?: number[]
) {
  let apiURL = AppInjector.get(SharedService).getDefaultApiUrl();
  if (formGroup.get('url')) {
    if (formGroup.get('url').value) {
      apiURL = formGroup.get('url').value;
    }
  }

  if (formGroup.get('url')) {
    if (formGroup.get('url').value) {
      apiURL = formGroup.get('url').value;
    }
  }

  try {
    const creditsObject: any = await requestGet(
      `${apiURL}/user/credits`,
      formGroup.get('token').value,
      http
    );
    if (creditsObject.credits === undefined) {
      // TODO: check credits value
      openSnackBarError(snackBar);
      return;
    }
    if (apiURL === AppInjector.get(SharedService).getDefaultApiUrl()) {
      cliService.setWoleetCliParameters(formGroup.get('token').value);
    } else {
      cliService.setWoleetCliParameters(
        formGroup.get('token').value,
        formGroup.get('url').value
      );
    }
    if (screenPage) {
      screenPage[0] = screenPage[0] + 1;
    }
  } catch (e) {
    openSnackBarError(snackBar);
    return;
  }
}

export function storeManualActionsPath(
  formGroup: FormGroup,
  storeService?: StoreService
) {
  storeService.setManualTimestampingsPath(
    formGroup.get('manualTimestampingsPath').value
  );
  storeService.setManualSealsPath(formGroup.get('manualSealsPath').value);
}

export async function checkwIDConnectionGetAvailableKeys(
  http: HttpClient,
  url: string,
  token: string,
  pubKeyAddressGroup: PubKeyAddressGroup[],
  snackBar: MatSnackBar
) {
  while (pubKeyAddressGroup.length) {
    pubKeyAddressGroup.pop();
  }

  let usersObject;
  let isAdminToken = false;
  try {
    const userObject: any = await requestGet(
      `${url}/discover/user`,
      token,
      http
    );
    usersObject = userObject ? [userObject] : null;
  } catch (e) {
    if (e.status !== 404) {
      openSnackBarErrorCleanpubKeyAddressGroup(pubKeyAddressGroup, snackBar);
      return;
    }
  }

  if (!usersObject) {
    isAdminToken = true;
    try {
      usersObject = await requestGet(
        `${url}/discover/users?search=%`,
        token,
        http
      );
    } catch (e) {
      openSnackBarErrorCleanpubKeyAddressGroup(pubKeyAddressGroup, snackBar);
      return;
    }
  }

  try {
    for (const user of usersObject) {
      if (isAdminToken && user.mode === 'esign') {
        continue;
      }
      const currentPubKeyAddressGroup: PubKeyAddressGroup = {
        user: `${user.identity.commonName}`,
        pubKeyAddress: [],
      };
      pubKeyAddressGroup.push(currentPubKeyAddressGroup);
      const currentUserKeysObject: any = await requestGet(
        `${url}/discover/keys/${user.id}`,
        token,
        http
      );
      for (const key of currentUserKeysObject) {
        if (key.status === 'active' && key.device === 'server') {
          if (key.id === user.defaultKeyId) {
            currentPubKeyAddressGroup.pubKeyAddress.unshift({
              key: `${key.name}`,
              address: `${key.pubKey}`,
            });
          } else {
            currentPubKeyAddressGroup.pubKeyAddress.push({
              key: `${key.name}`,
              address: `${key.pubKey}`,
            });
          }
        }
      }
    }
  } catch (e) {
    openSnackBarErrorCleanpubKeyAddressGroup(pubKeyAddressGroup, snackBar);
    return;
  }
}

export function openSnackBarError(snackBar: MatSnackBar) {
  const text =
    AppInjector.get(TranslationService).settings.errors.unableToLogin;
  snackBar.open(AppInjector.get(TranslateService).instant(text), undefined, {
    duration: 3000,
  });
}

export async function openSnackBarErrorCleanpubKeyAddressGroup(
  pubKeyAddressGroup: PubKeyAddressGroup[],
  snackBar: MatSnackBar
) {
  openSnackBarError(snackBar);
  while (pubKeyAddressGroup.length) {
    pubKeyAddressGroup.pop();
  }
}

async function requestGet(url: string, token: string, http: HttpClient) {
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
  };
  return http.get(url, httpOptions).toPromise();
}
