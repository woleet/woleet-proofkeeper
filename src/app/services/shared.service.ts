import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { dialog } from '@electron/remote';
import * as log from 'loglevel';
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
}
