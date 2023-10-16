// dragula.directive.ts
import { Directive, Input } from '@angular/core';

/**
 * this class stubs out ng2-dragula's DragulaDirective for loading server-side
 * you don't need any of this functionality on the server
 */
@Directive({
    /* tslint:disable */
    // disable linting here, because you need the selector to match ng2-dragula's DragulaDirective
    // which violates the selector prefix rules, if you have not disabled them
    selector: '[appDragula]'
    /* tslint:enable */
})
export class DragulaDirective {
    @Input() dragula: string;
    @Input() dragulaModel: any;
    @Input() dragulaOptions: any;
}
