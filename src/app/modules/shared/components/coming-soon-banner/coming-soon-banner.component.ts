import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-coming-soon-banner',
  templateUrl: './coming-soon-banner.component.html',
  styleUrls: ['./coming-soon-banner.component.scss']
})
export class ComingSoonBannerComponent implements OnInit {
  @Input() pageTitle: string;

  constructor() {
  }

  ngOnInit(): void {
  }
}
