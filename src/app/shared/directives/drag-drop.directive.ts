import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appDragDrop]'
})
export class DragDropDirective {

  isDropping: boolean;
  files;

  @Input() dropText: string;
  @Input() progress: number;

  @Output() readonly fileDropped = new EventEmitter<File>();
  @Output() readonly stopDropping = new EventEmitter<void>();

  // Dragover listener
  @HostListener('dragover', ['$event']) onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.isDropping = true;
  }

  // Dragleave listener
  @HostListener('dragleave', ['$event']) onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.stopDropping.emit();
  }

  // Drop listener
  @HostListener('drop', ['$event']) ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.files = evt.dataTransfer.files;
    if (this.files.length > 0) {
      this.fileDropped.emit(this.files[0]);
      return;
    }
    this.files = null;
    this.fileDropped.emit(null);
  }
  constructor() {}

}
