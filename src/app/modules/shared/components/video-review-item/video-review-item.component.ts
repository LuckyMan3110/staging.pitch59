import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { WelcomePageReview } from '../../models/welcome-page-review.model';

declare const Hls: any;
@Component({
  selector: 'app-video-review-item',
  templateUrl: './video-review-item.component.html',
  styleUrls: ['./video-review-item.component.scss']
})
export class VideoReviewItemComponent implements OnInit {
  @Input() review: WelcomePageReview;

  @ViewChild('videoPlayer', {static: true}) videoPlayer: ElementRef;

  hls;

  constructor() {
  }

  ngOnInit() {
  }

  playVideo() {
    if (!this.review.isVideoPlaying) {
      this.loadVideo();
    }
  }

  onVideoEnded() {
    this.review.isVideoPlaying = false;
  }

  loadVideo() {
    if (Hls.isSupported()) {
      if (this.hls) {
        this.hls.destroy();
      }
      this.hls = new Hls();
      this.hls.loadSource(this.review.videoUrl);
      this.hls.attachMedia(this.videoPlayer.nativeElement);
      this.review.isVideoPlaying = true;
      setTimeout(() => {
        this.videoPlayer.nativeElement.play();
      }, 300);
      this.review.isVideoPlaying = true;
    } else if (
      this.videoPlayer.nativeElement.canPlayType(
        'application/vnd.apple.mpegurl'
      )
    ) {
      this.videoPlayer.nativeElement.src = this.review.videoUrl;
      this.review.isVideoPlaying = true;
      setTimeout(() => {
        this.videoPlayer.nativeElement.play();
      }, 300);
    }
  }

  detachMedia() {
    this.review.isVideoPlaying = false;
    if (this.hls && Hls.isSupported()) {
      this.hls.stopLoad();
      this.hls.detachMedia();
      this.hls.destroy();
    }
  }
}
