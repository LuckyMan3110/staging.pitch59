import {
  Directive,
  Input,
  ElementRef,
  OnChanges,
  HostListener
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNoWhiteSpace]'
})
export class WhiteSpaceDirective implements OnChanges {
  @HostListener('input')
  trimText() {
    if (
      this.ref.nativeElement.value !== null &&
      this.ref.nativeElement.value !== ''
    ) {
      const isWhitespace =
        (this.ref.nativeElement.value || '').trim().length === 0;
      if (isWhitespace) {
        this.ref.nativeElement.value = (
          this.ref.nativeElement.value || ''
        ).trim();
        this.control.control.setValue(this.ref.nativeElement.value);
      }
    }
  }

  constructor(private ref: ElementRef, private control: NgControl) {
  }

  ngOnChanges(changes) {
    this.trimText();
  }
}
