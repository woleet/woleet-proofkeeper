import { Directive, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
})
export class TooltipDirective implements OnDestroy {
  @Input() appTooltip = ''; // The text for the tooltip to display

  private myPopup;

  constructor(private el: ElementRef) {}

  ngOnDestroy(): void {
    if (this.myPopup) {
      this.myPopup.remove();
    }
  }

  @HostListener('mouseenter') onMouseEnter() {
    let x =
      this.el.nativeElement.getBoundingClientRect().left +
      this.el.nativeElement.offsetWidth / 2; // Get the middle of the element
    let y =
      this.el.nativeElement.getBoundingClientRect().top +
      this.el.nativeElement.offsetHeight +
      6; // Get the bottom of the element, plus a little extra
    this.createTooltipPopup(x, y);
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.myPopup) {
      this.myPopup.remove();
    }
  }

  private createTooltipPopup(x: number, y: number) {
    let popup = document.createElement('div');
    popup.innerHTML = this.appTooltip;
    popup.setAttribute('class', 'tooltip-container');
    popup.style.top = y.toString() + 'px';
    popup.style.left = x.toString() + 'px';
    document.body.appendChild(popup);
    this.myPopup = popup;
  }
}
