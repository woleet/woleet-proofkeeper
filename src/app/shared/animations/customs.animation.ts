import {
  animate,
  animation,
  AUTO_STYLE,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

export const quitGoRightAnimation = animation([
  animate(175, style({ transform: 'translateX(100%)' })),
]);

export const quitGoUpAnimation = animation([
  animate(250, style({ transform: 'translateY(-100%)' })),
]);

export const collapseAnimation = trigger('collapseAnimation', [
  state('void', style({ height: '0' })),
  transition(':enter', [animate(175, style({ height: AUTO_STYLE }))]),
  transition(':leave', [animate(175, style({ height: 0 }))]),
]);

export const toastAnimation = trigger('toastTrigger', [
  // This refers to the @trigger we created in the template
  state('open', style({ transform: 'translateY(0%)' })), // This is how the 'open' state is styled
  state('close', style({ transform: 'translateY(-200%)' })), // This is how the 'close' state is styled
  transition('open <=> close', [
    // This is how they're expected to transition from one to the other
    animate('300ms ease-in-out'),
  ]),
]);
