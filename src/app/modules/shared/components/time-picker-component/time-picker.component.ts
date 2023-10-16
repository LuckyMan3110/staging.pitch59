import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ViewEncapsulation,
  AfterViewInit
} from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TimePickerComponent implements OnInit, AfterViewInit {
  _hours: number;
  timeFormat: string;
  pickerLevel: string;
  prevValue: number;
  hoursPrefix = '0';
  minutesPrefix = '0';

  $hoursSubject: Subject<any> = new Subject();
  $minsSubject: Subject<any> = new Subject();

  @ViewChild('hoursInput', {static: false}) hoursInput: InputNumber;
  @ViewChild('minutesInput', {static: false}) minsInput: InputNumber;
  @Output() timeChange = new EventEmitter<{ field: string; value: number }>();

  @Input() set hours(value: number) {
    this._hours = this.format12Hours(value);
  }

  @Input() minutes = 0;
  @Input() hoursField: string;
  @Input() minutesField: string;

  constructor() {
  }

  ngOnInit() {
    this.initSubscriptions();
  }

  ngAfterViewInit() {
    this.populateInitData();
  }

  populateInitData() {
    this.hoursInput.prefix = this._hours < 10 ? this.hoursPrefix : null;
    this.minsInput.prefix = this.minutes < 10 ? this.minutesPrefix : null;
  }

  initSubscriptions() {
    this.$hoursSubject.pipe(debounceTime(500)).subscribe((target) => {
      if (target?.value) {
        this.hoursPopulate(target.value);
      } else {
        this.timeChange.emit({field: this.hoursField, value: 0});
      }
    });

    this.$minsSubject.pipe(debounceTime(500)).subscribe((target) => {
      if (target?.value) {
        this.minsPopulate(target.value);
      } else {
        this.timeChange.emit({field: this.minutesField, value: 0});
      }
    });
  }

  toogleTimeFormat() {
    let result = this._hours;

    if (this.timeFormat === 'pm') {
      if (this._hours === 12) {
        result = 0;
      }
    } else {
      if (this._hours < 12) {
        result = this._hours + 12;
      }
    }

    this.timeChange.emit({field: this.hoursField, value: result});
  }

    format12Hours(hours: number): number {
        let result = hours;

      if (hours > 12) {
        result = hours % 12;
        this.timeFormat = 'pm';
      }

      if (hours < 12 && hours !== 0) {
        this.timeFormat = 'am';
      }

      if (hours === 12) {
        this.timeFormat = 'pm';
      }

      if (hours === 0) {
        result = 12;
        this.timeFormat = 'am';
      }

      this.prevValue = +result;

      return +result;
    }

  onHoursChanges(value: number) {
    this.hoursInput.prefix = null;
    this.$hoursSubject.next(value);
  }

  onMinutesChanges(value: number) {
    this.minsInput.prefix = null;
    this.$minsSubject.next(value);
  }

  hoursPopulate(value: number) {
    if (
      value === this.prevValue ||
      (value === 12 && this.prevValue === 0)
    ) {
      return;
    }

    let result = value;

    if (this.timeFormat === 'pm') {
      if (this.prevValue === 12 && value === 13) {
        result = 13;
      } else if (
        (this.prevValue === 12 || this.prevValue === 0) &&
        value === 11
      ) {
        result = 11;
      } else {
        result += 12;
      }
      this.hoursInput.prefix = null;
    }

    if (this.timeFormat === 'am') {
      if (this.prevValue === 12 && value === 13) {
        result = 1;
        this.hoursInput.prefix = this.hoursPrefix;
      }

      if (
        (this.prevValue === 12 || this.prevValue === 0) &&
        value === 11
      ) {
        result = 23;
      }
    }

    if (this.prevValue === 1 && value === 0) {
      if (this.timeFormat === 'pm') {
        result = 12;
        this.hoursInput.prefix = null;
      }

      if (this.timeFormat === 'am') {
        result = 0;
        this.hoursInput.prefix = this.hoursPrefix;
      }
    }

    if (result === 24) {
      result = 0;
      this.hoursInput.prefix = this.hoursPrefix;
    }

    this.timeChange.emit({field: this.hoursField, value: result});
  }

  minsPopulate(value: number) {
    this.minsInput.prefix = value < 10 ? this.minutesPrefix : null;
    this.timeChange.emit({field: this.minutesField, value: value});
  }
}
