import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppInjector } from '../app.module';
import { ToastService, TOAST_STATE } from '../services/toast.service';
import { TranslationService } from '../services/translation.service';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { PubKeyAddressGroup } from './identitiesFromServer';

export async function checkAndSubmit(
  http: HttpClient,
  formGroup: FormGroup,
  cliService: WoleetCliParametersService,
  toastService: ToastService,
  screenPage?: number[]
) {
  let apiURL = `https://api.woleet.io/v1`;
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
      openToastBarError(toastService);
      return;
    }
    if (apiURL === `https://api.woleet.io/v1`) {
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
    toastService.showToast(
      TOAST_STATE.danger,
      getTranslation(
        AppInjector.get(TranslationService).settings.errors.unableToLogin
      )
    );
    return;
  }
}

export async function checkwIDConnectionGetAvailableKeys(
  http: HttpClient,
  url: string,
  token: string,
  pubKeyAddressGroup: PubKeyAddressGroup[],
  toastService: ToastService
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
      openToastBarErrorCleanpubKeyAddressGroup(
        pubKeyAddressGroup,
        toastService
      );
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
      openToastBarErrorCleanpubKeyAddressGroup(
        pubKeyAddressGroup,
        toastService
      );
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
    openToastBarErrorCleanpubKeyAddressGroup(pubKeyAddressGroup, toastService);
    return;
  }
}

export function openToastBarError(toastService: ToastService) {
  toastService.showToast(
    TOAST_STATE.danger,
    getTranslation(
      AppInjector.get(TranslationService).settings.errors.unableToLogin
    )
  );
}

export async function openToastBarErrorCleanpubKeyAddressGroup(
  pubKeyAddressGroup: PubKeyAddressGroup[],
  toastService: ToastService
) {
  openToastBarError(toastService);
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

function getTranslation(key) {
  return AppInjector.get(TranslateService).instant(key);
}
