import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-context-menu',
    templateUrl: './context-menu.component.html',
    styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent {
    @Input() y: number = 0;
    @Input() x: number = 0;
    @Input() isVisible: boolean = false;

    constructor() {
    }
}
