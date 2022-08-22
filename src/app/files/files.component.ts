import { Component, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as log from 'loglevel';
import { concatMap } from 'rxjs/operators';
import { identityCheckerFactory } from '../folders/folders.component';
import { LogContext } from '../misc/logs';
import { CliRunnerFolderInterface } from '../services/cliRunnerFolderInterface.service';
import {
  FolderDesc,
  FoldersConfigService
} from '../services/foldersConfig.service';
import { IdentityContent, IdentityService } from '../services/Identity.service';
import { ProofReceiptService } from '../services/proof-receipt.service';
import { SecurityService } from '../services/security.service';
import { adaptPath, createNewFolder } from '../services/shared.service';
import { SignatureRequestService } from '../services/signature-request.service';
import { StoreService } from '../services/store.service';
import { ToastService, TOAST_STATE } from '../services/toast.service';
import { TranslationService } from '../services/translation.service';
import { collapseAnimation } from '../shared/animations/customs.animation';
import { Proof } from '../shared/interfaces/i-proof';
import { ParametersForWIDSSignature } from '../shared/interfaces/i-signature-request';
import { UserLog } from '../shared/interfaces/i-user';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
  animations: [collapseAnimation],
})
export class FilesComponent {
  public fileFormGroup: FormGroup;
  public foldersStatusCode: LogContext[];

  isDroppingAFile = false;
  selectedFile: File;
  fileHash: string;
  fileStream: fs.ReadStream;
  isHashing = false;
  progress = 0;
  metadata = {};
  openMetadataPanel = false;
  openCallbackURLPanel = false;
  anchorCallbackResult: UserLog;
  noApiTokenSet = this.storeService.store.get('token');
  proofReceiptsOfManualOperationsFolder: string;
  tags: Array<string> = [];

  constructor(
    public cliRunnerFolderInterface: CliRunnerFolderInterface,
    private formBuilder: FormBuilder,
    public identityService: IdentityService,
    public translations: TranslationService,
    private translateService: TranslateService,
    private zone: NgZone,
    private proofReceiptService: ProofReceiptService,
    private securityService: SecurityService,
    private signatureRequestService: SignatureRequestService,
    private storeService: StoreService,
    private foldersConfigService: FoldersConfigService,
    private toastService: ToastService
  ) {
    this.proofReceiptsOfManualOperationsFolder =
      this.storeService.getProofReceiptsOfManualOperationsFolder();
    this.fileFormGroup = this.formBuilder.group({
      name: ['', Validators.required],
      identityURL: [null],
      callbackURL: [null],
      metadata: [null],
      action: [
        'anchor',
        [Validators.required, Validators.pattern('anchor|sign')],
      ],
      public: [true],
      identity: [null, identityCheckerFactory(this)],
      metadataName: [null],
      metadataValue: [null],
      currentTag: [null],
    });
  }

  getCurrentMode(): 'anchor' | 'sign' {
    return this.fileFormGroup.get('action').value;
  }

  onTabChange(index: number) {
    if (index === 0 && this.getCurrentMode() === 'sign') {
      this.fileFormGroup.patchValue({
        action: 'anchor',
      });
      this.fileFormGroup.get('identity').removeValidators(Validators.required);
    } else if (index === 1 && this.getCurrentMode() === 'anchor') {
      this.fileFormGroup.patchValue({
        action: 'sign',
      });
      this.fileFormGroup.get('identity').addValidators(Validators.required);
    }
    this.fileFormGroup.get('identity').updateValueAndValidity();
  }

  changeTab() {
    if (this.getCurrentMode() === 'sign') {
      this.fileFormGroup.patchValue({
        action: 'anchor',
      });

      this.fileFormGroup.get('identity').removeValidators(Validators.required);
    } else if (this.getCurrentMode() === 'anchor') {
      this.fileFormGroup.patchValue({
        action: 'sign',
      });
      this.fileFormGroup.get('identity').addValidators(Validators.required);
    }
    this.fileFormGroup.get('identity').updateValueAndValidity();
  }

  isOnAnchorTab() {
    return this.getCurrentMode() === 'anchor';
  }

  isOnSignTab() {
    return this.getCurrentMode() === 'sign';
  }

  onCancel() {
    this.cancelFileHash();
    this.metadata = {};
    this.tags = [];
    this.openMetadataPanel = false;
    this.openCallbackURLPanel = false;
    this.resetAddFileFormGroup();
  }

  resetAddFileFormGroup() {
    this.fileFormGroup.reset({
      action: this.getCurrentMode(),
      public: true,
    });
  }

  onFileDropped(file: File) {
    if (file) {
      this.isHashing = true;
      this.selectedFile = file;

      this.hashFile(file).then((fileHash) => {
        this.fileHash = fileHash;
        this.fileFormGroup.get('name').setValue(this.selectedFile.name);
        this.isDroppingAFile = false;
      });
    }
  }

  cancelFileHash() {
    this.fileStream.close();
    this.fileHash = null;
    this.isHashing = false;
    this.isDroppingAFile = false;
  }

  hashFile(file: File): Promise<string> {
    this.fileStream = fs.createReadStream(file.path);

    if (Buffer.isBuffer(this.fileStream)) {
      const result = crypto
        .createHash('sha256')
        .update(this.fileStream)
        .digest('hex');
      return Promise.resolve(result);
    }

    const hasher = crypto.createHash('sha256');

    return new Promise((resolve, reject) => {
      const total = file.size;
      let progress = 0;
      try {
        this.fileStream.on('data', (data) => {
          hasher.update(data);
          progress += data.length;
          this.zone.run(() => {
            this.progress = progress / total;
          });
        });
        this.fileStream.on('end', () => {
          resolve(hasher.digest('hex'));
        });
        this.fileStream.on('error', (error) => {
          console.error(error.message, this.fileStream);
          reject();
        });
      } catch (error) {
        console.error(error.message, this.fileStream);
        reject(error);
      }
    });
  }

  onSelectedFile(event: Event) {
    const file = (event?.target as HTMLInputElement)?.files[0];
    this.onFileDropped(file);
  }

  addTag() {
    const tag = this.fileFormGroup.get('currentTag').value;
    if (tag && tag !== '' && !this.tags.includes(tag)) {
      this.tags.push(tag);
    }
    this.fileFormGroup.get('currentTag').setValue('');
  }

  removeTag(tag: string) {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  metadataIsValid(): boolean {
    const name = this.fileFormGroup.get('metadataName').value;
    const value = this.fileFormGroup.get('metadataValue').value;
    return !!name && !!value;
  }

  addMetadata() {
    const name = this.fileFormGroup.get('metadataName').value;
    const value = this.fileFormGroup.get('metadataValue').value;
    this.metadata[name] = value;
    this.fileFormGroup.get('metadataName').reset();
    this.fileFormGroup.get('metadataValue').reset();
  }

  deleteMetadata(key: string) {
    delete this.metadata[key];
  }

  onSubmit() {
    if (this.getCurrentMode() === 'anchor') {
      this.timestampFile();
      return;
    }

    this.sealFile();
  }

  timestampFile() {
    this.proofReceiptService.createAnchor(this.createProof()).subscribe(
      (proof) => {
        this.toastService.showToast(
          TOAST_STATE.success,
          this.translateService.instant(
            this.translations.files.successTexts[this.getCurrentMode()]
          ) + this.storeService.getProofReceiptsOfManualOperationsFolder()
        );
        this.onCancel();
        this.retrieveProofReceipt(proof.id, this.getCurrentMode());
      },
      (error) => {
        console.error('Cannot create timestamping: ', error);
        this.toastService.showToast(
          TOAST_STATE.danger,
          'Cannot create timestamping: ' + error.status
        );
      }
    );
  }

  sealFile() {
    const params: ParametersForWIDSSignature = {
      hashToSign: this.fileHash,
      identityToSign: 'ALL',
    };

    const identitySelected = this.identityService.arrayIdentityContent.filter(
      (identity) => identity.name === this.fileFormGroup.get('identity').value
    )[0];

    this.signatureRequestService
      .signHashWithWIDS(params, identitySelected)
      .pipe(
        concatMap((signatureAnchor) => {
          const seal = { ...signatureAnchor, ...this.createProof() };
          return this.proofReceiptService.createAnchor(seal);
        })
      )
      .subscribe(
        (proof) => {
          this.toastService.showToast(
            TOAST_STATE.success,
            this.translateService.instant(
              this.translations.files.successTexts[this.getCurrentMode()]
            ) + this.storeService.getProofReceiptsOfManualOperationsFolder()
          );
          this.onCancel();
          this.retrieveProofReceipt(
            proof.id,
            this.getCurrentMode(),
            identitySelected
          );
        },
        (error) => {
          console.error('Cannot create a seal: ', error);
          this.toastService.showToast(
            TOAST_STATE.danger,
            'Cannot create a seal: ' + error.status
          );
        }
      );
  }

  createProof() {
    const formValues = this.fileFormGroup.value;
    let proof: Proof = {};

    if (formValues.action === 'anchor') {
      proof.hash = this.fileHash;
    }

    proof.name = formValues.name;
    proof.public = formValues.public;

    if (this.tags && this.tags.length) {
      proof.tags = this.tags;
    }

    if (!!formValues.identityURL) {
      proof.identityURL = formValues.identityURL;
    }

    if (!!formValues.callbackURL) {
      proof.callbackURL = formValues.callbackURL;
    }

    if (this.metadata && Object.keys(this.metadata).length) {
      proof.metadata = this.metadata;
    }

    return proof;
  }

  testCallbackURL() {
    this.anchorCallbackResult = null;

    this.securityService
      .tryAnchorCallback('dummy', this.fileFormGroup.get('callbackURL').value)
      .subscribe((log) => (this.anchorCallbackResult = log));
  }

  retrieveProofReceipt(
    anchorId: string,
    action: 'sign' | 'anchor',
    identitySelected?: IdentityContent
  ) {
    this.proofReceiptService
      .getReceiptById(anchorId, true)
      .subscribe((content) => {
        const type = action === 'sign' ? 'seal' : 'timestamp';

        const fileName = adaptPath(
          `${this.proofReceiptsOfManualOperationsFolder}/${this.selectedFile.name}-${anchorId}.${type}-pending.json`
        );
        createNewFolder(this.proofReceiptsOfManualOperationsFolder);
        fs.writeFileSync(fileName, JSON.stringify(content, null, 2));

        this.addFolderIfNeeded(
          action,
          this.proofReceiptsOfManualOperationsFolder,
          identitySelected
        );
      });
  }

  addFolderIfNeeded(
    action: 'sign' | 'anchor',
    folderPath: string,
    identitySelected: IdentityContent
  ) {
    let folderExists;
    try {
      folderExists = this.foldersConfigService.getFolderParamFromActionPath(
        action,
        folderPath
      );
    } catch (e) {
      log.error(e);

      // Create and add folder if it does not exist
      const folderDesc: FolderDesc = {
        path: folderPath,
        action: action,
        private: false,
        strict: false,
        prune: false,
        recursive: false,
        filter: null,
        identityName: (identitySelected && identitySelected.name) || null,
        iDServerUnsecureSSL: null,
      };
      this.cliRunnerFolderInterface.addFolder(folderDesc);
    }
  }

  getIdentityNames() {
    return this.identityService.getIdentityNames();
  }

  errorOnSelectIdentity(form: FormGroup) {
    return this.identityService.errorOnSelectIdentity(form);
  }

  errorTextOnSelectIdentity(form: FormGroup) {
    return this.identityService.errorTextOnSelectIdentity(form);
  }
}
