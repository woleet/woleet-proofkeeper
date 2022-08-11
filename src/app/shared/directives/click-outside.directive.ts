import { Directive, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {
  @Output() readonly clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event.target']) onClick(target: Event) {
    const clickedInside = this.elementRef.nativeElement.contains(target);

    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
