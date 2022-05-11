import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirmationDialog.component.html',
})
export class ConfirmationDialogComponent {
  public confirmationText: String;
  public confirmationTitle: String;
  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>, public translations: TranslationService) {}
}
