import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
  @Input() confirmationText: string;
  @Input() confirmationTitle: string;
  @Output() readonly exitDialog = new EventEmitter<boolean>();

  constructor(public translations: TranslationService) {}
}
