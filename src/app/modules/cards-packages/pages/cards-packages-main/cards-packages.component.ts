import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Location } from '@angular/common';

import { CardPackage } from '../../models/card-package.model';
import { CardPackageService } from '../../services/card-package.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';
import { PitchCardType } from '../../../shared/enums/pitch-card-type.enum';
import { BillingFrequency } from '../../../new-billing/services/new-billing.service';

@Component({
  selector: 'app-cards-packages',
  templateUrl: './cards-packages.component.html',
  styleUrls: ['./cards-packages.component.scss'],
  providers: []
})
export class CardsPackagesComponent implements OnInit, OnDestroy {
  cardPackages: CardPackage[];
  scale: number;

    // Change theme of layout
    teamPackagesLayout = true;
    showContactUsModal = false;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;

  packagesSubscription = new Subscription();

  packageContainer: ElementRef;

  @ViewChild('packageContainer') set content(content: ElementRef) {
    if (content) {
      this.packageContainer = content;
      this.onResized(true);
    }
  }

  constructor(
    private cardPackagesService: CardPackageService,
    private deviceService: DeviceDetectorService,
    private location: Location
  ) {
    this.onResized = this.onResized.bind(this);
  }

  ngOnInit() {
    this.getLSInfo();
    this.getActivePricing();
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktop = this.deviceService.isDesktop();
    window.addEventListener('resize', this.onResized);
    }

    ngOnDestroy() {
        window.removeEventListener('resize', this.onResized);
        localStorage.removeItem('cardsPackageUrl');
        if (this.packagesSubscription) {
            this.packagesSubscription.unsubscribe();
        }
    }

    getLSInfo() {
        if (localStorage.getItem('cardsPackageUrl') === '/cards-packages') {
            this.teamPackagesLayout = true;
        }
    }

    getActivePricing() {
      this.packagesSubscription.add(
        this.cardPackagesService
          .getActivePricingByBusinessType()
          .subscribe((r) => {
            if (r.data) {
              const cardsPackages =
                this.cardPackagesService.getCardPackages();
              cardsPackages.map((pack) => {
                if (pack.type === PitchCardType.Resume) {
                  pack.monthPrice = 0;
                  pack.totalPrice = 0;
                } else {
                  pack.monthPrice = r.data.find(
                    (p) =>
                      pack.type === p.businessType &&
                      p.paymentFrequency ===
                      BillingFrequency.Monthly
                  )?.price;
                  pack.totalPrice = r.data.find(
                    (p) =>
                      pack.type === p.businessType &&
                      p.paymentFrequency ===
                      BillingFrequency.Annual
                  )?.price;
                }
              });
              this.cardPackages = cardsPackages;
            }
          })
      );
    }

    onResized(resize?) {
        if (this.packageContainer) {
          const packagesContainerWidth =
            this.packageContainer.nativeElement.clientWidth;
          let packegesInTheRow = 5;

          if (window.innerWidth < 768) {
            packegesInTheRow = 2;
          }
          if (window.innerWidth < 420) {
            packegesInTheRow = 1;
          }

          const allMargins = 20 * packegesInTheRow;
          const packageDefaultWidth = 253.5;

          this.scale =
            (packagesContainerWidth - allMargins) /
            packageDefaultWidth /
            packegesInTheRow;
          if (resize && typeof resize === 'boolean') {
            this.scale =
              this.teamPackagesLayout && !this.isMobile && !this.isTablet
                ? this.scale * 1.2
                : this.scale;
          }
          this.cardPackagesService.scaleFactor.next(this.scale);
        }
    }

    goBack() {
        this.location.back();
    }

    handleContactUs() {
        this.showContactUsModal = !this.showContactUsModal;
    }
}
