import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';

import { WeekDaysEnum } from '../../enums/week-days.enum';
import { DeviceDetectorService } from 'ngx-device-detector';

export interface BusinessHours {
    weekDay: number;
    open: {
      hours: number;
      minutes: number;
    };
    close: {
      hours: number;
      minutes: number;
    };
}

@Component({
  selector: 'app-business-hours',
  templateUrl: './business-hours.component.html',
  styleUrls: ['./business-hours.component.scss']
})
export class BusinessHoursComponent implements OnInit, OnDestroy {
  _workingHours: any;
  _weekDays: string[];
  subscription: Subscription;
  workingHoursForm: FormArray = new FormArray([]);
  isDesktop: boolean = this.deviceService.isDesktop();
  isTablet: boolean = this.deviceService.isTablet();
  isMobile: boolean = this.deviceService.isMobile();

  @Output() formChange = new EventEmitter<BusinessHours[]>();

  @Input()
  set workingHours(value: any) {
    const businessHoursRow = [];
    value.forEach((timesheet) => {
      if (
        !businessHoursRow.some((object, index) => {
          if (
            object.openHours === timesheet.open.hours &&
            object.openMinutes === timesheet.open.minutes &&
            object.closeHours === timesheet.close.hours &&
            object.closeMinutes === timesheet.close.minutes
          ) {
            businessHoursRow[index] = {
              ...businessHoursRow[index],
              [WeekDaysEnum[timesheet.weekDay]]: true
            };
            return true;
          }
          return false;
        })
      ) {
        if (
          timesheet.hasOwnProperty('open') &&
          timesheet.hasOwnProperty('close')
        ) {
          businessHoursRow.push({
            openHours: timesheet.open.hours,
            openMinutes: timesheet.open.minutes,
            closeHours: timesheet.close.hours,
            closeMinutes: timesheet.close.minutes,
            SUN: WeekDaysEnum.SUN === timesheet.weekDay,
            MON: WeekDaysEnum.MON === timesheet.weekDay,
            TUE: WeekDaysEnum.THU === timesheet.weekDay,
            WED: WeekDaysEnum.WED === timesheet.weekDay,
            THU: WeekDaysEnum.THU === timesheet.weekDay,
                        FRI: WeekDaysEnum.FRI === timesheet.weekDay,
                        SAT: WeekDaysEnum.SAT === timesheet.weekDay
                    });
                }
            }
        });

        businessHoursRow.forEach((object, index) => {
          const keys = Object.keys(WeekDaysEnum);
          const allDays = keys.slice(keys.length / 2, keys.length);

          allDays.forEach((day) => {
            if (!object[day]) {
              businessHoursRow[index] = {
                ...businessHoursRow[index],
                [day]: false
              };
            }
          });
        });

    this._workingHours = businessHoursRow;
  }

  constructor(private deviceService: DeviceDetectorService) {
  }

  ngOnInit() {
    this.setWeekDays();
    this.initializeForm();
    this.onFormChanges();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onFormChanges() {
    this.subscription = this.workingHoursForm.valueChanges.subscribe(
      (workingHours) => {
        this.updateMainForm(workingHours);
      }
    );
  }

  updateMainForm(workingHours: any) {
    const result = [];

    workingHours.forEach((schedule) => {
      Object.keys(schedule).forEach((key) => {
        if (schedule[key] && typeof schedule[key] === 'boolean') {
          result.push({
            weekDay: WeekDaysEnum[key],
            open: {
              hours: schedule.openHours,
              minutes: schedule.openMinutes
            },
            close: {
              hours: schedule.closeHours,
              minutes: schedule.closeMinutes
                        }
                    });
                }
            });
        });

    this.formChange.emit(result);
    }

    setWeekDays() {
        const keys = Object.keys(WeekDaysEnum);
        this._weekDays = keys.slice(keys.length / 2, keys.length);
    }

    initializeForm() {
        if (this._workingHours?.length) {
          this._workingHours.forEach((hours) => {
            this.addHours(hours);
          });
        }

        // if (!this._workingHours.length) this.addHours();
    }

    addHours(groupObject?) {
        const group = new FormGroup({
          SUN: new FormControl(groupObject ? groupObject.SUN : false),
          MON: new FormControl(groupObject ? groupObject.MON : true),
          TUE: new FormControl(groupObject ? groupObject.TUE : true),
          WED: new FormControl(groupObject ? groupObject.WED : true),
          THU: new FormControl(groupObject ? groupObject.THU : true),
          FRI: new FormControl(groupObject ? groupObject.FRI : true),
          SAT: new FormControl(groupObject ? groupObject.SAT : false),
          closeHours: new FormControl(
            groupObject ? groupObject.closeHours : 17
          ),
          closeMinutes: new FormControl(
            groupObject ? groupObject.closeMinutes : 0
          ),
          openHours: new FormControl(groupObject ? groupObject.openHours : 8),
          openMinutes: new FormControl(
            groupObject ? groupObject.openMinutes : 0
          )
        });

      this.workingHoursForm.push(group);
    }

  removeHours(index: number) {
    this.workingHoursForm.removeAt(index);
  }

  onTimePickerChanges(
    event: { field: string; value: number },
    formGroup: FormGroup
  ) {
    const {field, value} = event;

    formGroup.controls[field].setValue(value || +value);
  }
}
