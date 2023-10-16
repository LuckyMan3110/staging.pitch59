import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { NavigationEnd, ResolveStart, Router } from '@angular/router';
import { UserCommonService } from './modules/shared/services/user-common.service';
import { Subscription } from 'rxjs';
import { Gtag } from 'angular-gtag';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { NavigationService } from './modules/shared/services/navigation.service';

declare let fbq: Function;
declare let SmartBanner: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'app';
  signedIn = false;
  welcomePage = false;
  $hideLinks: Subscription;
  $showHeader: Subscription;
  showHeader = true;
  isBrowser: boolean;

  @ViewChild('headerBar') headerBar: ElementRef;

  constructor(
    private router: Router,
    private titleService: Title,
    gtag: Gtag,
    public navigationService: NavigationService,
    @Inject(PLATFORM_ID) private platformId,
    private userCommonService: UserCommonService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.titleService.setTitle(environment.title);
      router.events.subscribe((y: NavigationEnd) => {
        if (y instanceof NavigationEnd && fbq) {
          if (environment.trackPageviews) {
            fbq('track', 'PageView');
            gtag.pageview();
          }
        }

        if (y instanceof ResolveStart) {
          this.welcomePage = y.url === '/welcome' || y.url === '/';
        }
      });

      if (environment.trackPageviews) {
        this.addHotJar();
      }
    }
    this.navigationService.startSaveHistory();
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.welcomePage =
        this.router.url === '/welcome' || this.router.url === '/';
    }

    this.$hideLinks = this.userCommonService.hideLinks.subscribe(
      (isSignedIn) => {
        this.signedIn = isSignedIn; // used for hiding footer Login & signup link
      }
    );

    this.$showHeader = this.userCommonService.showHeader.subscribe(
      (show) => {
        this.showHeader = show;
      }
    );
  }

  ngAfterViewInit(): void {
    const banner = new SmartBanner({
      daysHidden: 10,
      daysReminder: 60,
      appStoreLanguage: 'us',
      title: 'Download the App',
      author: 'Pitch59 Inc',
      button: 'VIEW',
      appendTo: 'header-container',
      store: {
        ios: 'On the App Store',
        android: 'In Google Play'
      },
      price: {
        ios: 'FREE',
        android: 'FREE'
      },
      icon: '/assets/images/store-image.jpg'
    });
  }

  ngOnDestroy() {
    if (this.$hideLinks) {
      this.$hideLinks.unsubscribe();
    }

    if (this.$showHeader) {
      this.$showHeader.unsubscribe();
    }
  }

  hasSmartBanner() {
    return document.getElementsByClassName('smartbanner-show').length;
  }

  addHotJar() {
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.innerText =
      '(function(h,o,t,j,a,r){ h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)}; h._hjSettings={hjid:2607843,hjsv:6}; a=o.getElementsByTagName(\'head\')[0]; r=o.createElement(\'script\');r.async=1; r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv; a.appendChild(r); })(window,document,\'https://static.hotjar.com/c/hotjar-\',\'.js?sv=\');';
    document.head.appendChild(script);
  }
}
