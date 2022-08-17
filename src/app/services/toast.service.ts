import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  showsToast$ = new BehaviorSubject<boolean>(false);
  toastMessage$ = new BehaviorSubject<string>('Default Toast Message');
  toastState$ = new BehaviorSubject<string>(TOAST_STATE.success);

  constructor() {}

  showToast(toastState: string, toastMsg: string): void {
    this.toastState$.next(toastState);
    this.toastMessage$.next(toastMsg);
    this.showsToast$.next(true);
  }

  dismissToast(): void {
    this.showsToast$.next(false);
  }
}

export enum TOAST_STATE {
  success = 'success-toast',
  warning = 'warning-toast',
  danger = 'danger-toast',
}
