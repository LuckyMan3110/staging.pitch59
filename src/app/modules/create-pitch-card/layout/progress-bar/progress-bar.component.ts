import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {
    totalPercents: number = 0;

    @Input() totalSteps: number = 7;
    @Input() filledSteps: number = 0;
    @Input() percentsValue: number = 0;

    constructor() {}

    getPercentsProgress() {
        if (!this.percentsValue) {
            const filledPercent = (this.filledSteps * 100) / this.totalSteps;
          const emptyPercent = 100 - filledPercent;
            this.totalPercents = Math.round(filledPercent);
          return {filledPercent, emptyPercent};
        } else {
            const filledPercent = this.percentsValue;
            const emptyPercent = 100 - this.percentsValue;
            this.totalPercents = this.percentsValue;
          return {filledPercent, emptyPercent};
        }
    }
}
