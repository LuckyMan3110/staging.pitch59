import {
  Component,
  OnInit,
  ContentChild,
  Output,
  TemplateRef,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'app-done-modal',
  templateUrl: './done-modal.component.html',
  styleUrls: ['./done-modal.component.scss']
})
export class DoneModalComponent implements OnInit {
  constructor() {
  }

  @ContentChild('content') content: TemplateRef<any>;

  @Output() done = new EventEmitter<any>();

  ngOnInit(): void {
  }

  onClickDone() {
    this.done.emit();
  }
}
