import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'app-rating-box',
  templateUrl: './rating-box.component.html',
  styleUrls: ['./rating-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingBoxComponent implements OnInit {
  @Input() rating: number = -1;

  constructor() {
  }

  ngOnInit(): void {
  }
}
