import { Injectable } from '@angular/core';

@Injectable()
export class MyProfileService {
    private menuItems: string[] = [
      'my pitchcards',
      'pockets',
      'employer portal',
      'commissions'
    ];
    private selectedItem: string;

    getMenuItems() {
        return [...this.menuItems];
    }
}
