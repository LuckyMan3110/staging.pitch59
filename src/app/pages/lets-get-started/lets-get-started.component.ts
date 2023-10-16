import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UserCommonService } from '../../modules/shared/services/user-common.service';
import { AppSettings } from '../../modules/shared/app.settings';
import { StorageService } from '../../modules/shared/services/storage.service';
import { PitchCardType } from '../../modules/shared/enums/pitch-card-type.enum';
import { CardPackageService } from '../../modules/cards-packages/services/card-package.service';
import { BillingFrequency } from '../../modules/new-billing/services/new-billing.service';
import { ProductType } from '../../modules/shared/components/pricing-menu-components/pricing-menu.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-lets-get-started',
  templateUrl: './lets-get-started.component.html',
  styleUrls: ['./lets-get-started.component.scss']
})
export class LetsGetStartedComponent implements OnInit {
  isMobile: boolean = this.deviceService.isMobile();
  isAuthUser: boolean = this.userCommonService.isAuthenticated();
  isResumeCreated: boolean;

  constructor(
    private deviceService: DeviceDetectorService,
    private userCommonService: UserCommonService,
    private storageService: StorageService,
    private cardPackageService: CardPackageService,
    private confirmService: ConfirmationService
  ) {
  }

  ngOnInit() {
    this.isResumeCreated = this.storageService.getItem(
      AppSettings.IS_RESUME_EXIST
    )
      ? this.storageService.getItem(AppSettings.IS_RESUME_EXIST, true)
      : false;
  }

  setInformationModal() {
    this.confirmService.confirm({
      key: 'isResumeExist',
      header: this.isResumeCreated ? 'Resume Already Exists' : '',
      message: !this.isResumeCreated
        ? 'Resume Cards are only for helping you find employment or get recruited. Please confirm that you’re seeking new employment or exploring other job opportunities.'
        : '',
      acceptLabel: 'OK',
      acceptIcon: '-',
      rejectVisible: false,
      accept: () => {
        this.setResume();
      }
    });
  }

  setResume() {
    if (!this.isResumeCreated) {
      const selectedProduct = {
        businessType: PitchCardType.Resume,
        paymentFrequency: BillingFrequency.Monthly,
        type: ProductType.Single
      };
      this.cardPackageService.selectPackage(selectedProduct);
      this.storageService.setItem(AppSettings.PAYMENT_PLAN, {
        paymentFrequency: selectedProduct.paymentFrequency,
        type: selectedProduct.type
      });
      this.navigateToPage({url: 'create', withAuth: true});
    } else {
      return;
    }
  }

  navigateToPage(config: { url: string; withAuth: boolean }) {
    if (config.withAuth) {
      if (!this.isAuthUser) {
        this.cardPackageService.goToPage('/sign-up', {
          serviceurl: config.url
        });
      } else {
        this.cardPackageService.goToPage(config.url);
      }
    } else {
      this.cardPackageService.goToPage(config.url);
    }
  }
}
