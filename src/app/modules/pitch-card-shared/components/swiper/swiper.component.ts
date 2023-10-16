import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { Footer, Header, PrimeTemplate } from 'primeng/api';
import { UniqueComponentId } from 'primeng/utils';
import { fromEvent, of } from 'rxjs';
import { debounceTime, delay } from 'rxjs/operators';
import { SearchResultThumbnailComponent } from '../search-result-thumbnail/search-result-thumbnail.component';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-swiper',
  styleUrls: ['./swiper.component.scss'],
  templateUrl: './swiper.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class WttSwiperComponent
  implements AfterContentInit,
    AfterViewInit,
    AfterContentChecked,
    OnInit,
    OnDestroy {
  @HostBinding('style.--button-scale-factor')
  get scaleFactor() {
    return this.buttonScaleFactor;
  }

  @Input() get numVisible(): number {
    return this._numVisible;
  }

  set numVisible(val: number) {
    this._numVisible = val;
  }

  @Input() responsiveOptions: any[];

  @Input() contentClass: String = '';

  @Input() get value(): any[] {
    return this._value;
  }

  set value(val) {
    this._value = val;
    if (this._value) {
      const items = this.getItems(0, val?.length === 1);
      this.visibleItems = items;
      this.mirrorItems = items;
    }
  }

  @Input() circular = false;

  @Input() autoplayInterval = 0;

  @Input() style: any;

  @Input() styleClass: string;

  @Input() containerSize = 400;

  @Input() transitionDuration = 500;

  @Output() containerSizeChanged: EventEmitter<any> = new EventEmitter();

  @Output() indexChange: EventEmitter<any> = new EventEmitter();

  @ViewChild('itemsContainer') itemsContainer: ElementRef;

  @ViewChild('mirrorsContainer') mirrorsContainer: ElementRef;

  @ViewChild('itemsContainerWrapper') itemsContainerWrapper: ElementRef;

  @ViewChild('carouselContainer') carouselContainer: ElementRef;

  @ViewChild('prevButton') prevButton: ElementRef;
  @ViewChild('nextButton') nextButton: ElementRef;

  @ContentChild(Header) headerFacet;

  @ContentChild(Footer) footerFacet;

  @ContentChildren(PrimeTemplate) templates: QueryList<any>;

  @ContentChildren(SearchResultThumbnailComponent, {descendants: true})
  childItems: QueryList<any>;

  _numVisible = 1;

  buttonScaleFactor = 1;

  defaultButtonScale = 1;

  prevState: any = {
    numVisible: 0,
    value: []
  };

  defaultNumVisible = 1;

  _value: any[];

  carouselStyle: any;

  id: string;

  visibleItems: any[] = [];

  mirrorItems: any[] = [];

  startPos: any;
  touchStart: Touch;

  documentResizeListener: any;

  allowAutoplay: boolean;

  interval: any;

  isCreated: boolean;

  swipeThreshold = 20;

  isTransition: boolean;

  currentIndex = 0;

  currentOffset = 0;

  mirrorOffset = 0;

  direction: string = null;

  displayMirror = false;

  displayMirrorCurrent: boolean = null;

  currentOffsetSlides: number;

  mirrorStep = 3; // shows after how many slides we will change the mirror mode

  isVisible = false;

  isDebug = false;

  isMobile: boolean = this.deviceService.isMobile();

  public itemTemplate: TemplateRef<any>;

  constructor(
    public el: ElementRef,
    private cdRef: ChangeDetectorRef,
    private deviceService: DeviceDetectorService
  ) {
  }

  get domCount() {
    const domCount = this.numVisible + this.mirrorStep * 2;
    return Number.isInteger(domCount) ? domCount : Math.round(domCount) + 1;
  }

  ngOnInit() {
    this.defaultNumVisible = this.numVisible;
    this.calculatePosition();
  }

  ngAfterContentInit() {
    this.id = UniqueComponentId();
    this.allowAutoplay = !!this.autoplayInterval;

    this.createStyle();
    this.calculatePosition();

    if (this.responsiveOptions) {
      this.bindDocumentListeners();
    }
    this.templates.forEach((item) => {
      this.itemTemplate = item.template;
    });
  }

  ngAfterContentChecked() {
    if (!this.isCreated) {
      this.currentIndex = 0;
      const items = this.getItems(
        this.currentIndex,
        this.value?.length === 1
      );
      this.visibleItems = items;
      this.mirrorItems = items;

      this.calculateTransform();

      if (this.autoplayInterval) {
        this.startAutoplay();
      }

      this.isCreated = true;
    }
  }

  ngAfterViewInit() {
    this.calculateContainerSize();
    this.setContainersSize();
    if (!this.isCreated) {
      this.calculateTransform();
      this.isVisible = true;
      this.cdRef.detectChanges();
    } else {
      setTimeout(() => {
        this.calculateTransform();
        this.isVisible = true;
        this.cdRef.detectChanges();
      }, 500); // It should fix in another way
    }
  }

  ngOnDestroy() {
    if (this.documentResizeListener) {
      this.documentResizeListener.unsubscribe();
    }
    if (this.autoplayInterval) {
      this.stopAutoplay();
    }
  }

  setContainersSize() {
    this.mirrorsContainer.nativeElement.style.transitionDuration = '0ms';
    this.itemsContainer.nativeElement.style.transitionDuration = '0ms';
    if (this.displayMirror) {
      this.mirrorsContainer.nativeElement.style.transform = '';
      this.itemsContainer.nativeElement.style.transform = `translate3d(-${
        this.numVisible * this.containerSize * 9
      }px, 0px, 0px)`;
    } else {
      this.mirrorsContainer.nativeElement.style.transform =
        this.value?.length === 1
          ? ''
          : `translate3d(-${
            this.numVisible * this.containerSize * 9
          }px, 0px, 0px)`;
      this.itemsContainer.nativeElement.style.transform = '';
    }
  }

  moveForward() {
    this.currentOffset++;

    if (this.itemsContainer.nativeElement.children) {
      for (let i = 0; i < this._numVisible + this.mirrorStep * 2; i++) {
        this.itemsContainer.nativeElement.children[
          i
          ].style.transitionDuration = this.transitionDuration + 'ms';
        this.itemsContainer.nativeElement.children[i].style.transform =
          this.calculateMoving(
            i - this.currentOffset,
            this.currentOffset
          );
        if (
          this.itemsContainer.nativeElement.children[i].id !==
          'item-undefined'
        ) {
          this.itemsContainer.nativeElement.children[
            i
            ].classList.toggle(
            'p-carousel-item-shadow',
            !this.isCentralSlide(i)
          );
        }
        this.itemsContainer.nativeElement.children[i].style.zIndex =
          this.calculateZIndex(i - this.currentOffset);
      }
    }
  }

  moveForwardMirror() {
    this.mirrorOffset++;
    const {children} = this.mirrorsContainer.nativeElement;
    const length = this._numVisible + this.mirrorStep * 2;

    for (let i = 0; i < length; i++) {
      children[i].style.transitionDuration =
        this.transitionDuration + 'ms';
      children[i].style.transform = this.calculateMoving(
        i - this.mirrorOffset,
        this.mirrorOffset
      );
      if (children[i].id !== 'item-undefined') {
        children[i].classList.toggle(
          'p-carousel-item-shadow',
          !this.isCentralSlide(i - this.mirrorOffset)
        );
      }
      children[i].style.zIndex = this.calculateZIndex(
        i - this.mirrorOffset
      );
    }
  }

  moveBackward() {
    this.currentOffset--;

    if (this.itemsContainer.nativeElement.children) {
      for (let i = 0; i < this._numVisible + this.mirrorStep * 2; i++) {
        this.itemsContainer.nativeElement.children[
          i
          ].style.transitionDuration = this.transitionDuration + 'ms';
        this.itemsContainer.nativeElement.children[i].style.transform =
          this.calculateMoving(
            i - this.currentOffset,
            this.currentOffset
          );
        if (
          this.itemsContainer.nativeElement.children[i].id !==
          'item-undefined'
        ) {
          this.itemsContainer.nativeElement.children[
            i
            ].classList.toggle(
            'p-carousel-item-shadow',
            !this.isCentralSlide(i)
          );
        }
        this.itemsContainer.nativeElement.children[i].style.zIndex =
          this.calculateZIndex(i - this.currentOffset);
      }
    }
  }

  moveBackwardMirror() {
    this.mirrorOffset--;

    for (let i = 0; i < this._numVisible + this.mirrorStep * 2; i++) {
      this.mirrorsContainer.nativeElement.children[
        i
        ].style.transitionDuration = this.transitionDuration + 'ms';
      this.mirrorsContainer.nativeElement.children[i].style.transform =
        this.calculateMoving(i - this.mirrorOffset, this.mirrorOffset);
      if (
        this.mirrorsContainer.nativeElement.children[i].id !==
        'item-undefined'
      ) {
        this.mirrorsContainer.nativeElement.children[
          i
          ].classList.toggle(
          'p-carousel-item-shadow',
          !this.isCentralSlide(i - this.mirrorOffset)
        );
      }
      this.mirrorsContainer.nativeElement.children[i].style.zIndex =
        this.calculateZIndex(i - this.mirrorOffset);
    }
  }

  waitForExistElementChildren(targetNode) {
    return new Promise<void>((resolve) => {
      new MutationObserver((mutationRecords, observer) => {
        resolve();
        observer.disconnect();
      }).observe(targetNode, {childList: true, subtree: true});
    });
  }

  calculateTransform() {
    if (this.itemsContainer) {
      this.setPropToItems(this.itemsContainer, this.currentOffset);
      this.emitIndexChange();
    }
  }

  calculateTransformMirror() {
    if (this.mirrorsContainer) {
      this.setPropToItems(this.mirrorsContainer, this.mirrorOffset);
      this.emitIndexChange();
    }
  }

  setPropToItems(container, offset) {
    const {children} = container.nativeElement;
    const value =
      this.value?.length === 1
        ? 1
        : this.numVisible + this.mirrorStep * 2;
    for (let i = 0; i < value; i++) {
      const isCentralSlide =
        offset === this.mirrorOffset ? i - offset : i;
      children[i].style.transitionDuration =
        this.transitionDuration + 'ms';
      children[i].style.transform = this.calculateMoving(
        i - offset,
        offset
      );
      if (children[i].id !== 'item-undefined') {
        children[i].classList.toggle(
          'p-carousel-item-shadow',
          !this.isCentralSlide(isCentralSlide)
        );
        children[i].classList.toggle(
          'active',
          this.isCentralSlide(isCentralSlide)
        );
      }
      children[i].style.zIndex = this.calculateZIndex(i - offset);
    }
  }

  calculateMoving(index, offset) {
    return `translate3d(${
      this.containerSize * offset * -1
    }px, 0px, -${this.calculateTranslationOffset(index)}px)`;
  }

  calculateOffsetFromCenter(index) {
    return Math.abs(index - Math.floor(this.domCount / 2));
  }

  calculateZIndex(index) {
    return 100 - this.calculateOffsetFromCenter(index);
  }

  calculateTranslationOffset(index) {
    return this.calculateOffsetFromCenter(index) * this.containerSize;
  }

  setupSizes() {
    const calculate =
      Math.round(this.numVisible / 2) * this.containerSize + 'px';
    this.itemsContainer.nativeElement.style.width = calculate;
    this.mirrorsContainer.nativeElement.style.width = calculate;
    this.itemsContainerWrapper.nativeElement.style.perspective = calculate;
    this.createStyle();

    this.nextButton.nativeElement.style.right = `calc(45% - ${
      this.containerSize / 2
    }px - 1.25em)`;
    this.prevButton.nativeElement.style.left = `calc(45% - ${
      this.containerSize / 2
    }px - 1.25em)`;
  }

  getItems(index, isSingle?) {
    const container = [];
    for (let i = 0; i < this.domCount; i++) {
      if (this.getItemByIndex(i + index - this.mirrorStep - 2)) {
        container[i] = Object.assign(
          {},
          this.getItemByIndex(i + index - this.mirrorStep - 2)
        );
      } else {
        container[i] = Object.assign(
          {},
          this.value.find((item) =>
            i % 2 === 0 ? item.index === 1 : item.index === 0
          )
        );
      }
    }
    return isSingle ? [container.find((i) => i.business)] : container;
  }

  getItemByIndex(index) {
    return this.value[this.getItemIndex(index)];
  }

  getItemIndex(index) {
    if (this.circular) {
      if (index >= 0) {
        if (index >= this.value.length) {
          return (this.value.length - index) * -1;
        } else {
          return index;
        }
      }
      return this.value.length + index;
    } else {
      if (!this.value[index]) {
        return undefined;
      }
    }
    return index;
  }

  createStyle() {
    if (!this.carouselStyle) {
      this.carouselStyle = document.createElement('style');
      this.carouselStyle.type = 'text/css';
      document.body.appendChild(this.carouselStyle);
    }

    this.carouselStyle.innerHTML = `
            #${this.id} .p-carousel-item {
				flex: 1 0 ${this.containerSize}px
			}`;
  }

  isCentralSlide(index) {
    return (
      index - this.currentOffset ===
      Math.floor(this.visibleItems.length / 2)
    );
  }

  isCentralSlideMirror(index) {
    return (
      index - this.mirrorOffset ===
      Math.floor(this.mirrorItems.length / 2)
    );
  }

  calculateContainerSize() {
    const {clientWidth} = this.carouselContainer.nativeElement;
    this.containerSize =
      this.numVisible > 2
        ? clientWidth / Math.round(this.numVisible / 2)
        : this.value?.length === 1 && !this.isMobile
          ? clientWidth / 3
          : clientWidth / this.numVisible;

    this.containerSizeChanged.emit({
      containerSize: this.containerSize
    });
    this.setupSizes();
  }

  calculatePosition() {
    this.prevState.numVisible = this.numVisible;
    const {innerWidth} = window;

    let matchedResponsiveData = {
      numVisible: this.defaultNumVisible,
      buttonScale: this.defaultButtonScale
    };

    this.responsiveOptions.forEach((option) => {
      if (parseInt(option.breakpoint, 10) >= innerWidth) {
        matchedResponsiveData = {
          ...option,
          buttonScale:
            this.isMobile && this.containerSize
              ? 0.7
              : this.defaultButtonScale
        };
      }
    });

    this.numVisible = matchedResponsiveData.numVisible;
    this.buttonScaleFactor = matchedResponsiveData.buttonScale;
    if (this.itemsContainer && this.responsiveOptions) {
      this.calculateContainerSize();
    }
  }

  contentClasses() {
    return 'p-carousel-content ' + this.contentClass;
  }

  isCircular() {
    return (
      this.circular && this.value && this.value.length >= this.numVisible
    );
  }

  IsDisplayMirror() {
    if (this.displayMirror) {
      return !(Math.abs(this.mirrorOffset) === this.mirrorStep);
    } else {
      return Math.abs(this.currentOffset) === this.mirrorStep;
    }
  }

  getOffset() {
    return this.displayMirror ? this.mirrorOffset : this.currentOffset;
  }

  getCurrentOffset() {
    return Math.floor(this.domCount / 2) + this.getOffset();
  }

  emitIndexChange() {
    for (let i = 0; i < this.numVisible + this.mirrorStep * 2; i++) {
      if (
        this.isCentralSlide(
          i - (this.displayMirror ? this.mirrorOffset : 0)
        ) &&
        this.currentOffsetSlides !== i
      ) {
        if (i !== Math.floor(this.domCount / 2) + this.mirrorStep) {
          this.currentOffsetSlides = i;
          // console.log(i, 'currentOffset');
          // console.log(this.currentIndex, 'currentIndex');
          this.indexChange.emit({
            currentIndex: this.currentIndex,
            prevIndex: this.getCurrentOffset() - 1,
            currentOffset:
              this.currentIndex === 0 || this.currentIndex === -0
                ? this.isMobile
                  ? 4
                  : 5
                : this.currentOffsetSlides
          });
        }
      }
    }
  }

  navNext(direction = 'forward') {
    if (!this.isTransition) {
      this.isTransition = true;
      this.currentIndex = this.getItemIndex(
        direction === 'forward'
          ? ++this.currentIndex
          : --this.currentIndex
      );

      const index =
        direction === 'forward'
          ? this.currentIndex + this.mirrorStep
          : this.currentIndex - this.mirrorStep;

      if (this.displayMirrorCurrent === null) {
        this.mirrorItems = this.getItems(index - 1);
        this.waitForExistElementChildren(
          this.mirrorsContainer.nativeElement
        ).then(() => this.calculateTransformMirror());
      }

      if (direction === 'forward') {
        if (this.displayMirror) {
          this.moveForwardMirror();
        } else {
          this.moveForward();
        }
      } else {
        if (this.displayMirror) {
          this.moveBackwardMirror();
        } else {
          this.moveBackward();
        }
      }
      this.emitIndexChange();

      this.displayMirrorCurrent = this.displayMirror;
      of(null)
        .pipe(delay(this.transitionDuration))
        .subscribe(() => {
          this.isTransition = false;
          this.displayMirror = this.IsDisplayMirror();

          if (this.displayMirror !== this.displayMirrorCurrent) {
            if (this.displayMirror) {
              this.currentOffset = 0;
              this.calculateTransformMirror();
              this.visibleItems = this.getItems(index);
              this.waitForExistElementChildren(
                this.itemsContainer.nativeElement
              ).then(() => {
                this.calculateTransform();
              });
            } else {
              this.mirrorOffset = 0;
              this.calculateTransform();
              this.mirrorItems = this.getItems(index);
              this.waitForExistElementChildren(
                this.mirrorsContainer.nativeElement
              ).then(() => {
                this.calculateTransformMirror();
              });
            }
            this.setContainersSize();
          }

          if (this.displayMirror) {
            this.currentOffset = 0;
            this.calculateTransformMirror();
            this.visibleItems = this.getItems(
              index - this.mirrorOffset
            );
            this.waitForExistElementChildren(
              this.itemsContainer.nativeElement
            ).then(() => this.calculateTransform());
          } else {
            this.mirrorOffset = 0;
            this.calculateTransform();
            this.mirrorItems = this.getItems(
              index - this.currentOffset
            );
            this.waitForExistElementChildren(
              this.mirrorsContainer.nativeElement
            ).then(() => this.calculateTransformMirror());
          }

          this.direction = direction;
        });
    }
  }

  startAutoplay() {
    this.interval = setInterval(() => {
      this.navNext('forward');
    }, this.autoplayInterval + this.transitionDuration);
  }

  stopAutoplay() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  onTouchStart(e: TouchEvent) {
    if (this.isMobile && this.visibleItems?.length <= 1) {
      return;
    }
    this.touchStart = e.changedTouches[0];

    this.startPos = {
      x: this.touchStart.pageX,
      y: this.touchStart.pageY
    };
  }

  onTouchMove(e) {
    if (e.cancelable) {
      e.preventDefault();
    }
  }

  onTouchEnd(e: TouchEvent) {
    if (this.isMobile && this.visibleItems?.length <= 1) {
      return;
    }
    const touchEnd: Touch = e.changedTouches[0];
    if (this.touchStart?.clientY && touchEnd.clientY) {
      if (
        this.touchStart.clientY >
        touchEnd.clientY + this.swipeThreshold
      ) {
        // scroll to bottom
        window.scrollTo({
          top: touchEnd.pageY + 50,
          behavior: 'smooth'
        });
      } else if (this.touchStart.clientY < touchEnd.clientY - 5) {
        // scroll to top
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    }

    this.changePageOnTouch(e, touchEnd.pageX - this.startPos.x);
  }

  changePageOnTouch(e, diff) {
    if (Math.abs(diff) > this.swipeThreshold) {
      if (diff < 0) {
        this.navNext('forward');
      } else {
        this.navNext('backward');
      }
    }
  }

  bindDocumentListeners() {
    if (!this.documentResizeListener) {
      this.documentResizeListener = fromEvent(window, 'resize')
        .pipe(debounceTime(100))
        .subscribe(() => {
          this.calculatePosition(); // Calculate numVisible, containerSize and set new sizes
          this.calculateContainerSize();
          if (this.prevState.numVisible !== this.numVisible) {
            const step =
              this.numVisible !== this.defaultNumVisible ? 1 : 0;
            const mirrorStep =
              this.numVisible !== this.defaultNumVisible
                ? -1
                : -2;

            this.mirrorItems = this.getItems(
              this.mirrorOffset + this.mirrorStep
            );
            this.visibleItems = this.getItems(
              step + this.currentOffset
            );

            this.setContainersSize();

            if (this.displayMirror) {
              this.waitForExistElementChildren(
                this.mirrorsContainer.nativeElement
              ).then(() => this.calculateTransformMirror());
            } else {
              this.waitForExistElementChildren(
                this.itemsContainer.nativeElement
              ).then(() => this.calculateTransform());
            }
          } else {
            if (this.displayMirror) {
              this.calculateTransformMirror();
            } else {
              this.calculateTransform();
            }
          }
        });
    }
  }

  removeEmpty(array): any[] {
    return array.filter((element) => {
      return Object.keys(element).length !== 0;
    });
  }
}
