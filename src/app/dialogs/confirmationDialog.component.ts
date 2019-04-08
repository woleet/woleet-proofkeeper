import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'confirm-delete-dialog',
  templateUrl: './confirmationDialog.component.html',
})
export class ConfirmationDialog {
  public confirmationText: String;
  public confirmationTitle: String;
  constructor(public dialogRef: MatDialogRef<ConfirmationDialog>) { }
}