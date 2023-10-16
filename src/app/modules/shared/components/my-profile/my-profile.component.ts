import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';

import { UiService } from '../../services/ui.service';
import { UserCommonService } from '../../services/user-common.service';
import { StorageService } from '../../services/storage.service';
import { MyProfileService } from './my-profile.service';

import { UserModel } from '../../models/user.model';

import { AppSettings } from '../../app.settings';
import { DeviceDetectorService } from 'ngx-device-detector';
import { TitleCasePipe } from '@angular/common';
import { CommonBindingDataService } from '../../services/common-binding-data.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html'
})
export class MyProfileComponent implements OnInit, OnDestroy {
  menuItems: string[] = [];
  userModel = new UserModel();
  userModelLoading: boolean = false;
  isMenuCollapsed: boolean = false;
  isMobile: boolean = false;
  blockEmployerPortalLink: boolean;
  selectedMenuItem: string;
  fullName: string = 'Profile Name';
  imageSource: string =
    '/assets/images/my-account-images/profile-sidebar-images/';
  $updatedUserInfo: Subscription;
  $teamsInfo: Subscription;
  $onRouteChanges = new Subscription();
  $teamCountSubscribe = new Subscription();

  constructor(
    private userCommonService: UserCommonService,
    private uiService: UiService,
    private commonBindingDataService: CommonBindingDataService,
    private storageService: StorageService,
    private myProfileService: MyProfileService,
    private router: Router,
    private deviceService: DeviceDetectorService,
    private titleCasePipe: TitleCasePipe
  ) {
  }

  ngOnInit() {
    this.isMobile = this.deviceService.isMobile();
    this.getUserData();
    this.menuItems = this.myProfileService.getMenuItems();
    window.addEventListener('resize', this.onResized);
    this.onResized();
    this.onLinkChange();
  }

  ngOnDestroy() {
    if (this.$updatedUserInfo) {
      this.$updatedUserInfo.unsubscribe();
    }
    if (this.isMobile) {
      this.$onRouteChanges.unsubscribe();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.onResized();
  }

  onResized() {
    if (window.innerWidth <= 767) {
      this.isMenuCollapsed = true;
      this.isMobile = true;
    } else {
      this.isMenuCollapsed = false;
      this.isMobile = false;
    }
    this.blockEmployerPortalLink = !this.deviceService.isDesktop();
  }

  onLinkChange() {
    this.$onRouteChanges.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          if (this.isMobile) {
            this.isMenuCollapsed = true;
          }
        }
      })
    );
  }

  getUserData() {
    const userDetails = JSON.parse(
      this.storageService.getItem(AppSettings.USER_DETAILS)
    );
    const token = this.storageService.getItemFromCookies(
      AppSettings.TOKEN_KEY
    );

    if (userDetails && token) {
      this.userModelLoading = true;
      this.userCommonService.getUserProfile(userDetails.userId).subscribe(
        (result) => {
          this.userModel = result.data;
          const profileName =
            this.userModel.firstName +
            ' ' +
            this.userModel.lastName;

          if (profileName) {
            this.fullName = profileName;
          }
          this.userModelLoading = false;
          this.$updatedUserInfo =
            this.userCommonService.updatedUserInfo.subscribe(
              (data: { fullName: string }) => {
                this.fullName = data.fullName;
              }
            );
          this.userModelLoading = false;
        },
        (error) => {
          const errorMsg = error.Message
            ? error.Message
            : 'Error while getting profile';
          this.uiService.errorMessage(errorMsg);
          this.userModelLoading = false;
        }
      );
    }
  }

  handleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  createPitchCard() {
    this.storageService.setItemInCookies(
      AppSettings.DRAFT_BUSINESS_ID,
      null
    );

    this.router.navigate(['cards-packages']);
  }

  handleTooltip(teamName): boolean {
    return teamName.length < 18;
  }

  desktopOnlyItem(menuItem: string) {
    this.uiService.warningMessage(
      this.titleCasePipe.transform(menuItem) +
      ' ' +
      this.commonBindingDataService.getLabel('msg_only_for_desktop')
    );
  }
}
