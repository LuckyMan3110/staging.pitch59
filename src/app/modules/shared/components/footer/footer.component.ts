import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserCommonService } from '../../services/user-common.service';
import { Subscription } from 'rxjs';
import { WelcomePageService } from '../../../../pages/welcome-page/welcome-page.service';
import { AppSettings } from '../../app.settings';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit, OnDestroy {
  @Input() hideFooterlinks = false;
  helpCenterLink = AppSettings.helpCenterLink;

  $hideLinks: Subscription;

  constructor(
    private router: Router,
    private welcomePageService: WelcomePageService,
    private userCommonService: UserCommonService
  ) {
  }

  ngOnInit() {
    this.$hideLinks = this.userCommonService.hideLinks.subscribe(
      (isSignedIn) => {
        this.hideFooterlinks = isSignedIn;
      }
    );
    this.hideFooterlinks = this.userCommonService.isAuthenticated();
  }

  ngOnDestroy() {
    if (this.$hideLinks) {
      this.$hideLinks.unsubscribe();
    }
  }

  goToPage(link, query?) {
    this.welcomePageService.smoothVerticalScrolling(0, 300);
    setTimeout(() => {
      query
        ? this.router.navigate([link], {queryParams: query})
        : this.router.navigate([link]);
    }, 300);
  }
}
