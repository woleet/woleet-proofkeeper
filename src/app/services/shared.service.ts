import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { app, dialog } from '@electron/remote';
import * as fs from 'fs';
import * as log from 'loglevel';
import { environment } from '../../environments/environment';
import { WoleetCliParametersService } from './woleetcliParameters.service';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor(private cli: WoleetCliParametersService) {}

  getHTTPHeaders(token = this.cli.getToken()) {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  /**
   * Convert a JSON object to URI parameters.
   * @param data The JSON object to convert
   * @returns The URI parameters
   */
  dataToURI(data) {
    if (!data || Object.keys(data).length === 0) return '';
    const _data = [];
    for (const prop in data) {
      if (data[prop])
        _data.push(
          [encodeURIComponent(prop), encodeURIComponent(data[prop])].join('=')
        );
    }
    return '?' + _data.join('&');
  }

  openPopupDirectory(
    folderFormGroup: FormGroup,
    label = 'path',
    currentPath?: string
  ) {
    let path: string;
    try {
      path = dialog.showOpenDialogSync({
        properties: ['openDirectory'],
        defaultPath: currentPath,
      })[0];
    } catch (error) {
      path = currentPath;
    } finally {
      folderFormGroup;
      folderFormGroup.patchValue({
        [label]: path,
      });
      log.info(`Setting folder: ${folderFormGroup.get(label).value}`);
    }
  }

  translateLegacyAction(action: string): string {
    if (action === 'anchor') {
      return 'timestamp';
    }
    if (action === 'sign') {
      return 'seal';
    }
    return action;
  }

  resetPath(folderFormGroup: FormGroup, key = 'path') {
    folderFormGroup.patchValue({
      [key]: '',
    });
  }

  getDefaultApiUrl() {
    return `https://api.woleet.${
      environment.production ? 'io' : 'localhost'
    }/v1`;
  }
}

export function  getDefaultFolderPathForManualActions(subfolder: string) {
  const path = `${app.getPath('documents')}/ProofKeeper/${subfolder}`;
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
  return path;
}