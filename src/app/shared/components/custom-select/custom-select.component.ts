import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss']
})
export class CustomSelectComponent {
  @Input() labelName: string;
  @Input() options;
  @Input() selectedOption;
  @Input() forLogMode : boolean;
  @Output() readonly onChangeOption = new EventEmitter();

  showSelectOptions = false;

  constructor(private sharedService: SharedService) { }

  changeOption(option) {
    this.onChangeOption.emit(option);
    this.showSelectOptions = false;
  }

  translateLegacyAction(action: string): string {
    return this.sharedService.translateLegacyAction(action);
  }

}
