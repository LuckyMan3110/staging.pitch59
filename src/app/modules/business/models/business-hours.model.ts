import { WeekDay } from '../enums/week-day.enum';

export class BusinessHours {
    weekDay: WeekDay;
    open: Date;
    close: Date;
}
