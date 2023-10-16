import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CardPackageService } from '../../../services/card-package.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CardPackage } from '../../../models/card-package.model';
import { UserCommonService } from '../../../../shared/services/user-common.service';
import { PitchCardType } from '../../../../shared/enums/pitch-card-type.enum';
import { Subscription } from 'rxjs';
import { BusinessService } from '../../../../business/services/business.service';

@Component({
  selector: 'app-new-cards-packages',
  templateUrl: './new-cards-packages.component.html',
  styleUrls: ['./new-cards-packages.component.scss']
})
export class NewCardsPackagesComponent implements OnInit, OnDestroy {
  cardsPackages: CardPackage[] = [];
  descriptionsList = [];
  selectedBillingType = '';
  isMobile: boolean;

  $packageSub = new Subscription();

  @HostListener('window:keypress', ['$event'])
  @HostListener('window:click', ['$event'])
  handleClick(event: any) {
    if (this.selectedBillingType && this.isMobile) {
      document
        .getElementById(this.selectedBillingType)
        .scrollIntoView({block: 'center', behavior: 'smooth'});
    }
    if (event.key === 'Enter' && this.selectedBillingType) {
      this.goToBilling();
    }
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cardPackagesService: CardPackageService,
    private deviceDetectorService: DeviceDetectorService,
    private userCommonService: UserCommonService,
    private businessService: BusinessService
  ) {
  }

  ngOnInit(): void {
    this.initCardsPackages();
    this.isMobile = this.deviceDetectorService.isMobile();
  }

  ngOnDestroy() {
    if (this.$packageSub) {
      this.$packageSub.unsubscribe();
    }
  }

  initCardsPackages() {
    this.cardsPackages = this.cardPackagesService.getMockOfPCs();
    this.descriptionsList =
      this.cardPackagesService.getPackageDescription();
  }

  getBusinessTypeValue(type: string) {
    return this.cardPackagesService.getBusinessTypeValue(type);
  }

  goToBilling() {
    let selectedPackage;
    this.cardPackagesService.getCardPackages().map((pack) => {
      if (pack.type === this.selectedBillingType) {
        selectedPackage = pack;
      }
    });
    this.cardPackagesService.selectPackage(selectedPackage);
    this.setNavigateUrl();
  }

  setNavigateUrl() {
    if (!this.userCommonService.isAuthenticated()) {
      this.router.navigate(['/sign-up'], {
        queryParams: {
          serviceurl:
            this.cardPackagesService.selectedType ===
            PitchCardType.Resume
              ? 'create'
              : '/billing-page/virtual-video'
        }
      });
    } else {
      if (
        this.cardPackagesService.selectedType === PitchCardType.Resume
      ) {
        this.router.navigate(['create']);
      } else {
        this.router.navigate(['/billing-page/virtual-video']);
      }
    }
  }

  goToPage(path) {
    this.router.navigateByUrl(path);
  }
}
