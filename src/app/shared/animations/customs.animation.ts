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
