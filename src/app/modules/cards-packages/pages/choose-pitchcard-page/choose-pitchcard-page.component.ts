import { Component, OnInit } from '@angular/core';
import { CardPackageService } from '../../services/card-package.service';
import { PitchCardType } from '../../../shared/enums/pitch-card-type.enum';
import { UserCommonService } from '../../../shared/services/user-common.service';
import { Router } from '@angular/router';
import { AppSettings } from '../../../shared/app.settings';
import { ProductType } from '../../../shared/components/pricing-menu-components/pricing-menu.service';
import { PricingProduct } from '../../../new-billing/model/pricing-product';

@Component({
  selector: 'app-choose-pitchcard-page',
  templateUrl: './choose-pitchcard-page.component.html',
  styleUrls: ['./choose-pitchcard-page.component.scss']
})
export class ChoosePitchcardPageComponent implements OnInit {
  isAuthUser: boolean = this.userCommonService.isAuthenticated();
  showInformationModal: boolean = false;
  pitchCardConfig: {
    pack: any;
    product: PricingProduct;
    hasUserEmployerPortal: boolean;
  };
  selectedType: string;
  PitchCardTypes = PitchCardType;

  constructor(
    private cardPackagesService: CardPackageService,
    private userCommonService: UserCommonService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
  }

  handlePitchCardConfig(options: {
    pack: any;
    product: PricingProduct;
    hasUserEmployerPortal: boolean;
  }) {
    this.pitchCardConfig = options;
    if (
      (!options.hasUserEmployerPortal &&
        options?.pack?.businessType === PitchCardType.Job) ||
      options?.pack?.businessType === PitchCardType.Resume
    ) {
      this.selectedType = this.cardPackagesService.getBusinessTypeValue(
        this.pitchCardConfig?.pack?.businessType
      );
      this.showInformationModal = true;
    } else {
      this.setNavigateUrl();
    }
  }

  setNavigateUrl() {
    const virtualVideoUrl = '/billing-page/virtual-video';
    const billingSummaryUrl = '/billing-page/billing-summary';
    const createPageUrl = 'create';
    const employerPortalUrl = '/account/employer-portal';

    if (!this.isAuthUser) {
      let serviceurl = '';
      if (
        this.pitchCardConfig?.pack?.businessType ===
        PitchCardType.Resume &&
        this.pitchCardConfig.product.type === ProductType.Single
      ) {
        serviceurl = createPageUrl;
      } else if (
        (this.pitchCardConfig.product.type === ProductType.Single ||
          this.pitchCardConfig.product.type === ProductType.Portal) &&
        this.pitchCardConfig?.pack?.businessType === PitchCardType.Job
      ) {
        serviceurl = billingSummaryUrl;
      } else if (
        this.pitchCardConfig.product.type === ProductType.Portal
      ) {
        serviceurl = billingSummaryUrl;
      } else if (
        this.pitchCardConfig.product.type === ProductType.Single
      ) {
        serviceurl = virtualVideoUrl;
      }
      this.cardPackagesService.goToPage('/sign-up', {
        serviceurl: serviceurl
      });
    } else {
      if (
        this.pitchCardConfig?.pack?.businessType ===
        PitchCardType.Resume &&
        this.pitchCardConfig.product.type === ProductType.Single
      ) {
        this.router.navigate([createPageUrl]);
      } else if (this.pitchCardConfig.hasUserEmployerPortal) {
        if (
          (this.pitchCardConfig.product.type === ProductType.Single ||
            this.pitchCardConfig.product.type ===
            ProductType.Portal) &&
          this.pitchCardConfig?.pack?.businessType ===
          PitchCardType.Job
        ) {
          this.cardPackagesService.goToPage(employerPortalUrl, {
            createType: PitchCardType.Job
          });
        } else if (
          this.pitchCardConfig.product.type === ProductType.Portal
        ) {
          this.cardPackagesService.goToPage(employerPortalUrl, {
            createType: this.pitchCardConfig?.pack?.businessType
          });
        } else if (
          this.pitchCardConfig.product.type === ProductType.Single
        ) {
          this.cardPackagesService.goToPage(virtualVideoUrl);
        }
      } else if (!this.pitchCardConfig.hasUserEmployerPortal) {
        if (
          this.pitchCardConfig.product.businessType ===
          PitchCardType.Job
        ) {
          this.cardPackagesService.goToPage(billingSummaryUrl);
        } else if (
          this.pitchCardConfig.product.type === ProductType.Portal
        ) {
          this.cardPackagesService.goToPage(billingSummaryUrl);
        } else if (
          this.pitchCardConfig.product.type === ProductType.Single
        ) {
          this.cardPackagesService.goToPage(virtualVideoUrl);
        }
      }
    }
  }
}
