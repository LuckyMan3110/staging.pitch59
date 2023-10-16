import {
  Component,
  ViewChild,
  OnInit,
  Input,
  HostBinding,
  Output,
  EventEmitter,
  OnChanges,
  ElementRef
} from '@angular/core';
import { CommonBindingDataService } from '../../../shared/services/common-binding-data.service';
import format from 'date-fns/format';

@Component({
  selector: 'app-business-review-item',
  templateUrl: './business-review-item.component.html',
  styleUrls: ['./business-review-item.component.scss']
})
export class BusinessReviewItemComponent implements OnInit, OnChanges {
  @Input() review: any;
  @Input() isOrganization: boolean = false;

  @Output() handleMenu: EventEmitter<any> = new EventEmitter();
  @Output() handleVideo: EventEmitter<any> = new EventEmitter();
  @Output() isShow: EventEmitter<any> = new EventEmitter();

  @Input() scale = 0.85;
  @Input() businessType: string;

  createdAt: string;
  videoWidth: number = Math.round(320 * this.scale);
  videoHeight: number = Math.round(180 * this.scale);

  @ViewChild('coverImage') coverImage: ElementRef;

  isCoverLandscape = true;

  @HostBinding('style.--scale-factor-main')
  get scaleFactor() {
    return this.scale;
  }

  averageRating = 0;

  constructor(private commonBindingDataService: CommonBindingDataService) {
  }

  toggleMenu(event) {
    event.stopPropagation();
    this.handleMenu.next({event, reviewId: this.review.id});
  }

  onVideoClick(event) {
    this.handleVideo.next(event);
  }

  calcCover() {
    this.isCoverLandscape =
      this.coverImage.nativeElement.naturalWidth /
      this.coverImage.nativeElement.naturalHeight >
      1.33;
  }

  ngOnInit(): void {
    if (this.review) {
      this.averageRating =
        (+this.review.customerService + +this.review.quality) / 2;
      this.createdAt = format(
        new Date(Number.parseInt(this.review.createdAt)),
        'MM/dd/yyyy'
      );
    }
  }

  setTestimonialVisibility(e) {
    this.isShow.emit(e);
  }

  ngOnChanges() {
    this.videoWidth = Math.round(320 * this.scale);
    this.videoHeight = Math.round(180 * this.scale);
  }
}
