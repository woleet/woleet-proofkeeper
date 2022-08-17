import { Component } from '@angular/core';
import { ToastService } from '../../../services/toast.service';
import { toastAnimation } from '../../animations/customs.animation';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [toastAnimation],
})
export class ToastComponent {
  toastClass: Array<string>;
  toastMessage: string;
  showsToast: boolean;

  constructor(public toast: ToastService) {}

  dismiss(): void {
    this.toast.dismissToast();
  }
}
