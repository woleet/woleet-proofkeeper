import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, NgZone } from '@angular/core';
import {
  FormBuilder,
  FormGroup, Validators
} from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { identityCheckerFactory } from '../folders/folders.component';
import { LogContext } from '../misc/logs';
import { CliRunnerFolderInterface } from '../services/cliRunnerFolderInterface.service';
import { IdentityService } from '../services/Identity.service';
import { TranslationService } from '../services/translation.service';

export interface tag {
  name: string;
}

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
})
export class FilesComponent {
  public fileFormGroup: FormGroup;
  public foldersStatusCode: LogContext[];
  
  addState = false;
  isDroppingAFile = false;
  selectedFile: FileWithHash;
  isHashing = false;
  progress = 0;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: Array<string> = [];

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our tag
    if (value) {
      this.tags.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  constructor(
    public cliRunnerFolderInterface: CliRunnerFolderInterface,
    private formBuilder: FormBuilder,
    public identityService: IdentityService,
    public translations: TranslationService,
    private zone: NgZone
  ) {
    this.fileFormGroup = this.formBuilder.group({
      name: [''],
      tags: [''],
      identityURL: [''],
      callbackURL: [''],
      metadata: [''],
      action: [
        'anchor',
        [Validators.required, Validators.pattern('anchor|sign')],
      ],
      public: [true],
      identity: ['', identityCheckerFactory(this)],
    });
  }

  onTabChange(index: number) {
    if (index === 0 && this.fileFormGroup.get('action').value === 'sign') {
      this.fileFormGroup.patchValue({
        action: 'anchor',
      });
    } else if (
      index === 1 &&
      this.fileFormGroup.get('action').value === 'anchor'
    ) {
      this.fileFormGroup.patchValue({
        action: 'sign',
      });
    }
    this.fileFormGroup.get('identity').updateValueAndValidity();
  }

  onCancelAddClick() {
    this.addState = false;
    this.selectedFile = null;
    this.resetAddFileFormGroup();
  }

  resetAddFileFormGroup() {
    this.fileFormGroup.reset({
      action: this.fileFormGroup.get('action').value,
      path: '',
      public: true,
    });
  }

  onFileDropped(file: File) {
    if (file) {
      this.isHashing = true;
      this.selectedFile = {
        file: null,
        hash: null
      };

      this.hashFile(file).then((fileWithHash) => {
        this.selectedFile = fileWithHash;
        this.fileFormGroup.get('name').setValue(this.selectedFile.file.name);
        this.addState = true;
        this.isHashing = false;
      });
    }
  }

  hashFile(file: File) {
    const fileStream = fs.createReadStream(file.path);
    if (Buffer.isBuffer(fileStream)) {
      const result = crypto
        .createHash('sha256')
        .update(fileStream)
        .digest('hex');
      return Promise.resolve({
        hash: result,
        file,
      });
    }

    const hasher = crypto.createHash('sha256');

    return new Promise((resolve, reject) => {
      const total = file.size;
      let progress = 0;
      try {
        fileStream.on('data', (data) => {
          hasher.update(data);
          progress += data.length;
          this.zone.run(() => {
            this.progress = progress / total;
          });
        });
        fileStream.on('end', () => {
          resolve({
            hash: hasher.digest('hex'),
            file: file,
          });
        });
        fileStream.on('error', (error) => {
          console.error(error.message, fileStream);
          reject();
        });
      } catch (error) {
        console.error(error.message, fileStream);
        reject(error);
      }
    });
  }

  onSelectedFile(event: Event) {
    const file = (event?.target as HTMLInputElement)?.files[0];
    this.onFileDropped(file);
  }

  onClickTimestamp() {
    this.addState = false;
    this.resetAddFileFormGroup();
  }
}

interface FileWithHash {
  file?: File;
  hash?: string;
}
