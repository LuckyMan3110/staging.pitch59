import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Subscription } from 'rxjs';
import { CommonBindingDataService } from '../../services/common-binding-data.service';
import { StorageService } from '../../services/storage.service';
import { UserCommonService } from '../../services/user-common.service';
import { AppSettings } from '../../app.settings';
import { IHeaderMenuItem } from '../../models/header-menu.interface';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UiService } from '../../services/ui.service';
import { SearchService } from '../../../pitch-card-shared/components/search-result/search.service';
import { BannerConfig, BannerTypes, WelcomePageService } from '../../../../pages/welcome-page/welcome-page.service';

@Component({
  selector: 'app-welcome-page-header',
  styleUrls: ['./welcome-page-header.component.scss'],
  templateUrl: './welcome-page-header.component.html'
})
export class WelcomePageHeaderComponent implements OnInit, OnDestroy {
  createOrEdit: string = 'Create A';
  emailId: string;
  isBrowser: boolean = false;
  isBusiness: boolean;
  items: IHeaderMenuItem[];
  unauthorizedItems: IHeaderMenuItem[];
  defaultProfileUrl: String = AppSettings.DEFAULT_PROFILE_IMAGE_URL;
  profilePictureThumbnailUrl: String = this.defaultProfileUrl;
  profileUrl: string = AppSettings.DEFAULT_PROFILE_IMAGE_URL;
  serviceurl: string;
  signedIn: boolean = false;
  subscription: Subscription;
  userChecked: boolean = false;
  userFullName: string;
  userFirstName: string;
  isMobile: boolean = this.deviceDetector.isMobile();
  isDesktop: boolean = window.innerWidth >= 1024;
  blockEmployerPortalLink: boolean;

  $createOrEditSubject: Subscription;
  $hideLinks: Subscription;
  $updatedUserInfo: Subscription;
  $isSignedInSubscription = new Subscription();
  bannerConfig: BannerConfig;
  BannerTypesEnum = BannerTypes;

  @Input() searchPage = true;
  @Input() elementToAppend: ElementRef;

  @ViewChild('menu') menu: OverlayPanel;
  @ViewChild('menuItemsForAuthUser') menuItemsForAuthUser: ElementRef;
  @ViewChild('notAuthorizedMenu') notAuthorizedMenu: OverlayPanel;
  @ViewChild('menuItemsForGuests') menuItemsForGuests: ElementRef;
  @ViewChild('footerForAuthUser') footerForAuthUser: ElementRef;
  @ViewChild('footerForGuestUsers') footerForGuestUsers: ElementRef;
  @ViewChild('headerBar') headerBar: ElementRef;

  constructor(
    private commonBindingDataService: CommonBindingDataService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private userCommonService: UserCommonService,
    private deviceDetector: DeviceDetectorService,
    private uiService: UiService,
    private searchService: SearchService,
    private welcomePageService: WelcomePageService,
    @Inject(PLATFORM_ID) private platformId
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.onResized();
  }

  @HostListener('window:click', ['$event'])
  handleClick(event: any) {
    const path = event.path || (event.composedPath && event.composedPath());

    try {
      if (
        this.menuItemsForAuthUser.nativeElement === event.target ||
        this.menuItemsForAuthUser.nativeElement.contains(
          event.target
        ) ||
        this.footerForAuthUser.nativeElement === event.target
      ) {
        this.menu.hide();
      }
      if (
        this.menuItemsForGuests.nativeElement === event.target ||
        this.menuItemsForGuests.nativeElement.contains(event.target) ||
        this.footerForGuestUsers.nativeElement.contains(event.target)
      ) {
        this.notAuthorizedMenu.hide();
      }
    } catch (ex) {
      console.log('Error while window click listener');
    }
  }

  goToPage(link, query?) {
    this.welcomePageService.smoothVerticalScrolling(0, 300);
    setTimeout(() => {
      query
        ? this.router.navigate([link], {queryParams: query})
        : this.router.navigate([link]);
    }, 400);
  }

  refreshSearch() {
    if (
      this.router.url.includes('search-result') ||
      this.router.url.includes('search')
    ) {
      this.userCommonService.onSearch.next();
    }
    this.router.navigate(['/search'], {
      skipLocationChange: this.router.url.includes('search'),
      queryParams: {
        types: this.route.snapshot.queryParams?.types
          ? this.route.snapshot.queryParams.types
          : 'basic.employee'
      }
    });
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.$createOrEditSubject =
        this.userCommonService.createOrEditSubject.subscribe(
          (value) => {
            this.createOrEdit = value;
          }
        );
      this.serviceurl = this.route.snapshot.queryParams.serviceurl;
      this.userCommonService.createOrEdit();
      this.initSetup();
      this.reloadInit();
      this.signedInSubscription();
      this.bannerConfig = this.welcomePageService.getBannerConfig(this.BannerTypesEnum.MainBanner);
    }
    if (this.router.url == '/jobs'){
      this.isBusiness = true;
    } else{
      this.isBusiness = false;
    }
  }

  ngOnDestroy() {
    if (this.$hideLinks) {
      this.$hideLinks.unsubscribe();
    }
    if (this.$updatedUserInfo) {
      this.$updatedUserInfo.unsubscribe();
    }
    if (this.$createOrEditSubject) {
      this.$createOrEditSubject.unsubscribe();
    }
    if (this.$isSignedInSubscription) {
      this.$isSignedInSubscription.unsubscribe();
    }
  }

  reloadInit() {
    this.$hideLinks = this.userCommonService.hideLinks.subscribe(
      (isLoadheader: boolean) => {
        if (isLoadheader) {
          this.initSetup();
        } else {
          this.setUnauthorizedItems();
        }
      }
    );
  }

  onResized() {
    this.blockEmployerPortalLink =
      this.isMobile || window.innerWidth < 1024;
  }

  initSetup() {
    const userDetails =
      this.storageService.getItem(AppSettings.USER_DETAILS) &&
      JSON.parse(this.storageService.getItem(AppSettings.USER_DETAILS));
    const token = this.storageService.getItemFromCookies(
      AppSettings.TOKEN_KEY
    );

    if (userDetails && token) {
      this.updateUserInfoAndMenuItems(userDetails);
    } else {
      this.userChecked = true;
      this.clearSession();
      this.setUnauthorizedItems();
    }

    interface userDataSubscriber {
      fullName: string;
      profilePictureThumbnailUrl: string;
    }

    this.$updatedUserInfo =
      this.userCommonService.updatedUserInfo.subscribe(
        (data: userDataSubscriber) => {
          this.userFullName = data.fullName;
          this.profilePictureThumbnailUrl =
            data.profilePictureThumbnailUrl ||
            '/assets/images/default_profile.png';
          this.setItems();
        }
      );
  }

  updateUserInfoAndMenuItems(userDetails: any) {
    this.userCommonService.getUserProfile(userDetails.userId).subscribe(
      (result) => {
        if (result && result.data) {
          this.userFirstName = result.data.firstName;
          this.userFullName =
            result.data.firstName + ' ' + result.data.lastName;
          this.emailId = result.data.emailId;
          this.signedIn = true;
          this.userChecked = true;

          if (userDetails && result.data.profilePictureThumbnailUrl) {
            this.profilePictureThumbnailUrl =
              result.data.profilePictureThumbnailUrl ||
              '/assets/images/default_profile.png';
          }

          if (this.router.url.includes('sign-in')) {
            this.userCommonService.profileHasBeenReceived.next(
              true
            );
          }

          this.storageService.setItem(
            AppSettings.IS_RESUME_EXIST,
            this.userCommonService.isResumeCreated
          );
          if (
            this.userCommonService.userOrganizationProgress?.length
          ) {
            this.storageService.setItem(
              AppSettings.ORGANIZATION_PROGRESS,
              this.userCommonService.userOrganizationProgress[0]
            );
          } else {
            this.storageService.removeItem(
              AppSettings.ORGANIZATION_PROGRESS
            );
          }

          this.setItems();
        }
      },
      (error) => {
        this.userChecked = true;
        this.doSignOut();
      }
    );
  }

  setItems() {
    this.items = [
      {
        label: 'My PitchCards',
        route: 'account/my-pitchcards',
        icon: 'assets/images/my-account-images/profile-sidebar-images/my-pitchcards.svg'
      },
      {
        label: 'Pockets',
        route: 'account/pockets',
        icon: 'assets/images/my-account-images/profile-sidebar-images/pockets.svg'
      },
      {
        label: 'Employer Portal',
        route: 'account/employer-portal',
        icon: 'assets/images/my-account-images/profile-sidebar-images/employer-portal.svg'
      },
      {
        label: 'Commissions',
        route: 'account/commissions',
        icon: 'assets/images/my-account-images/profile-sidebar-images/commissions.svg'
      }
    ];
  }

  setUnauthorizedItems() {
    this.unauthorizedItems = [
      {
        label:
          (this.signedIn ? this.createOrEdit : 'Create a ') +
          'PitchCard',
        route: '/select-pitchcards',
        icon: 'assets/images/my-account-images/profile-sidebar-images/my-pitchcards.svg',
        command: this.goToAddbusiness
      },
      {
        label: 'PitchCard Pricing',
        route: '/select-pitchcards',
        icon: 'assets/images/my-account-images/profile-sidebar-images/commissions.svg'
      },
      {
        label: 'Search',
        route: `/search`,
        icon: 'assets/images/search-green.svg',
        command: this.refreshSearch
      }
    ];
  }

  doSignOut() {
    this.userCommonService.logout().subscribe(
      (results) => {
        this.signedIn = false;
        this.clearSession();
        this.goToPage('/sign-in');
      },
      (error) => {
        this.clearSession();
      }
    );
  }

  clearSession() {
    this.userCommonService.clearSession();

    if (!this.route.snapshot.queryParams.signup) {
      this.userCommonService.signupUserData = null;
    }
  }

  goToAddbusiness() {
    this.storageService.setItemInCookies(
      AppSettings.DRAFT_BUSINESS_ID,
      null
    );

    if (this.createOrEdit === 'Finish') {
      this.router.navigate(['create']);
      return;
    }

    this.router.navigate(['cards-packages']);
  }

  setDownloadSourceLink() {
    return navigator.userAgent.match(/Android/i)
      ? 'https://play.google.com/store/apps/details?id=com.pitch.fiftynine'
      : 'https://apps.apple.com/us/app/pitch59/id1502156356';
  }

  signedInSubscription() {
    this.$isSignedInSubscription.add(
      this.userCommonService.isSignIn.subscribe((val) => {
        this.signedIn = val;
      })
    );
  }

  setNavigateUrl(url) {
    if (this.route.snapshot.queryParams.serviceurl) {
      this.router.navigate([url], {
        queryParams: {
          serviceurl: this.route.snapshot.queryParams.serviceurl
        }
      });
    } else {
      this.router.navigate([url]);
    }
  }

  desktopOnlyItem(menuItem: string) {
    if (!this.isDesktop) {
      this.uiService.warningMessage(
        this.commonBindingDataService.getLabel(menuItem) +
        ' ' +
        this.commonBindingDataService.getLabel(
          'msg_only_for_desktop'
        )
      );
    } else {
      this.welcomePageService.setLastPageUrl();
    }
  }

  scrollTop() {
    this.welcomePageService.smoothVerticalScrolling(0, 300);
  }

  hasSmartBanner() {
    return document.getElementsByClassName('smartbanner-show').length;
  }
}
