import {Directive, ElementRef, Host, Optional, AfterViewChecked, AfterContentChecked, Input} from '@angular/core';
import {MatGridTile, MatGridTileText} from '@angular/material';

@Directive({
  selector: '[appFontFitSize]'
})
export class FontFitSizeDirective implements AfterContentChecked {
  window: Window;

  @Input() minSize = 8;
  @Input() maxSize = 92;

  constructor(private el: ElementRef) {
  }

  ngAfterContentChecked() {
    // this.el.nativeElement.style.backgroundColor = 'yellow';
    // this.el.nativeElement.style.alignSelf = 'flex-end';

    const element = (this.el.nativeElement as HTMLElement);
    const parent = element.parentElement;
    const header = parent.children.item(0) as HTMLElement;
    // const parent = element.parentElement;
    if (!this.window) {
      this.window = parent.ownerDocument.defaultView;
    }

    const fontSize = parseFloat(this.style(element).fontSize);
    const elementWidth = parseFloat(this.style(element).width);
    const elementHeight = parseFloat(this.style(element).height);

    const headerHeight = parseFloat(this.style(header).height);
    const parentWidth = parseFloat(this.style(parent).width);
    const parentHeight = parseFloat(this.style(parent).height) - headerHeight;

    const ratioWidth = fontSize / elementWidth;
    const ratioHeight = fontSize / elementHeight;

    const newSizeWidth = Math.max(Math.min(parentWidth * ratioWidth, this.maxSize), this.minSize);
    const newSizeHeight = Math.max(Math.min(parentHeight * ratioHeight, this.maxSize), this.minSize);
    const newSize = Math.min(newSizeHeight, newSizeWidth);
    element.style.paddingTop = `${headerHeight + 8}px`;
    element.style.fontSize = `${newSize}px`;
    element.style.alignSelf = 'flex-start';
  }

  style(element: HTMLElement) {
    return this.window.getComputedStyle(element, null);
  }
}
