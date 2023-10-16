import { Component, OnInit, Inject, HostListener } from '@angular/core';

@Component({
  selector: 'app-back-to-the-top-button',
  templateUrl: './back-to-the-top-button.component.html',
  styleUrls: ['./back-to-the-top-button.component.scss']
})
export class BackToTheTopButtonComponent implements OnInit {
  windowScrolled: boolean;
    constructor() {}

  @HostListener('window:scroll', [])
    onWindowScroll() {
    if (
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop > 100
    ) {
      this.windowScrolled = true;
    } else if (
      (this.windowScrolled && window.pageYOffset) ||
      document.documentElement.scrollTop ||
      document.body.scrollTop < 10
    ) {
      this.windowScrolled = false;
    }
  }
    scrollToTop() {
      (function smoothscroll() {
        var currentScroll =
          document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScroll > 0) {
          window.requestAnimationFrame(smoothscroll);
          window.scrollTo(0, currentScroll - currentScroll / 8);
        }
      })();
    }

  ngOnInit() {
    this.scrollToTop();
  }
}
