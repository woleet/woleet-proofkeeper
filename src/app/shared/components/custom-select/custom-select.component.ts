import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss'],
})
export class CustomSelectComponent {
  @Input() labelName: string;
  @Input() options;
  @Input() selectedOption;
  @Input() activeLangPipe: boolean;
  @Input() activeLogPipe: boolean;
  @Input() onError: boolean;
  @Input() forPublicKeyMode: boolean;
  @Output() readonly onChangeOption = new EventEmitter();

  showSelectOptions = false;

  constructor() {}

  changeOption(option) {
    this.onChangeOption.emit(option);
    this.showSelectOptions = false;
  }
}
