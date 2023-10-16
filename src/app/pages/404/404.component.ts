import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { PixelService } from 'ngx-pixel';

@Component({
  selector: 'app-404',
  templateUrl: './404.component.html',
  styleUrls: ['./404.component.scss']
})
export class NotFoundPageComponent {
  constructor(private router: Router, private pixel: PixelService) {
    this.pixel.track('PageView', {
      content_name: '404 - Not Found'
    });
  }

  goHome() {
    this.router.navigate(['/welcome']);
  }
}
