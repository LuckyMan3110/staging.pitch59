import { Router, ActivatedRoute } from '@angular/router';
import { RestApiService } from './rest-api.service';
import { Observable } from 'rxjs';
import { Injectable, Output, EventEmitter } from '@angular/core';
import { AppSettings } from './../app.settings';
import { StorageService } from './../services/storage.service';
import { CommonBindingDataService } from './../services/common-binding-data.service';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class SidebarService {
  menuItems: any;
  private sideSubject = new Subject<any>();
  sideState = this.sideSubject.asObservable();
  adminSideBar = [];
  corpId;
  userDetails;
  accessDetailsList: any;

  constructor(
    private translateService: TranslateService,
    private commonService: CommonBindingDataService,
    private storageService: StorageService,
    private restApiService: RestApiService,
    private router: Router,
    private actRoute: ActivatedRoute
  ) {
  }

  addModule(menuItemName, menuItem) {
    if (this.menuItems.includes(menuItemName)) {
    }
  }

  sequentialMenuArrangement() {
  }
}
