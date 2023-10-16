import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { Carousel } from 'primeng/carousel';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StepperComponent implements OnInit, AfterViewInit, OnDestroy {
  scaleFactor: number = 0.88;

  showStepperButtons: boolean = true;
  numVisible: number = 8;
  numScroll: number = 8;
  responsiveOptions = [
    {
      breakpoint: '1920px',
      numVisible: 8,
      numScroll: 8
    },
    {
      breakpoint: '1340px',
      numVisible: 7,
      numScroll: 7
    },
    {
      breakpoint: '1200px',
      numVisible: 6,
      numScroll: 6
    },
    {
      breakpoint: '1100px',
      numVisible: 5,
      numScroll: 5
    },
    {
      breakpoint: '992px',
      numVisible: 4,
      numScroll: 4
    }
  ];

  @Input() items: StepperItem[] = [];
  @Input() current: number;
  @Input() isMobile: boolean = false;
  @Input() disabledMode: boolean = false;
  @Input() justView: boolean = false;

  @Output() stepClicked: EventEmitter<any> = new EventEmitter();

  @ViewChild('stepperCarousel', {static: false}) stepperCarousel: Carousel;
  @ViewChild('stepProgressContainer', {static: false})
  stepProgressContainer: ElementRef;

  @HostBinding('style.--scale-factor') get scale() {
    return this.scaleFactor;
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.stepperCarousel) {
      if (event.keyCode === 39) {
        this.stepperCarousel.navForward(event);
      }
      if (event.keyCode === 37) {
        this.stepperCarousel.navBackward(event);
      }
    }
  }

  constructor() {
    this.onResized = this.onResized.bind(this);
  }

  ngOnInit(): void {
    window.addEventListener('resize', this.onResized);
    this.onResized();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResized);
  }

  ngAfterViewInit() {
    this.onResized();
  }

  onResized() {
    this.updateNumValues();
    this.checkStepperButtons();
    this.updateTilesScaleFactor();
  }

  updateTilesScaleFactor() {
    this.scaleFactor = 0.88;

    if (window.innerWidth <= 1280 && window.innerWidth > 1100) {
      this.scaleFactor = 0.8;
    }

    if (window.innerWidth <= 860 && window.innerWidth >= 768) {
      this.scaleFactor = 0.76;
    }
  }

  updateNumValues() {
    this.numVisible = 8;
    this.numScroll = 8;

    if (window.innerWidth <= 1340 && window.innerWidth > 1200) {
      this.numVisible = 7;
      this.numScroll = 7;
    }

    if (window.innerWidth <= 1200 && window.innerWidth > 1100) {
      this.numVisible = 6;
      this.numScroll = 6;
    }

    if (window.innerWidth <= 1100 && window.innerWidth > 992) {
      this.numVisible = 5;
      this.numScroll = 5;
    }

    if (window.innerWidth <= 992) {
      this.numVisible = 4;
      this.numScroll = 4;
    }
  }

  checkStepperButtons() {
    if (this.items.length > this.numVisible) {
      this.showStepperButtons = true;
      return;
    }
    this.showStepperButtons = false;
  }

  onClick(value) {
    this.stepClicked.emit(value);
  }
}

export class StepperItem {
  label: string;
  value: any;
  completed: boolean;
  icon?: string;
  iconCompleted?: string;
  visited?: boolean;
}
