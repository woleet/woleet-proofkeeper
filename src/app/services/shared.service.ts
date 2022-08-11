import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor() {}

  translateLegacyAction(action: string): string {
    if (action === 'anchor') {
      return 'timestamp';
    }
    if (action === 'sign') {
      return 'seal';
    }
    return action;
  }
}
