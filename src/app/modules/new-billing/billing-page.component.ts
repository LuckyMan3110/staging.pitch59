import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { PricingProduct } from './model/pricing-product';
import { NewBillingService } from './services/new-billing.service';
import { CreatePitchCardService } from '../create-pitch-card/create-pitch-card.service';
import { BusinessPitch } from '../business/models/business-pitch.model';
import { CardPackage } from '../cards-packages/models/card-package.model';
import { CardPackageService } from '../cards-packages/services/card-package.service';
import { StorageService } from '../shared/services/storage.service';
import { BusinessService } from '../business/services/business.service';
import { AppSettings } from '../shared/app.settings';
import { PitchCardType } from '../shared/enums/pitch-card-type.enum';
import { PixelService } from 'ngx-pixel';

declare const Calendly: any;

@Component({
  selector: 'app-billing-page',
  templateUrl: './billing-page.component.html',
  styleUrls: ['./billing-page.component.scss']
})
export class BillingPageComponent implements OnInit, AfterViewInit, OnDestroy {
  scaleFactor = 0.6;
  paymentFrequencyOptions = [
    {
      label: 'Monthly',
      value: 'monthly'
    },
    {
      label: 'Annual',
      value: 'annual'
    }
  ];
  businessDetails = new BusinessPitch();
  selectedPackage: CardPackage;
  $billingPageSubscription = new Subscription();
  cardDescription = '';
    isMobile: boolean;
    confirmedSelection: boolean = false;
    isVirtualVideoPage: boolean = this.router.url.includes('virtual-video');
    selectDate: Date;

    externalProductType: string;
    pricingProducts: PricingProduct[];

  @ViewChild('packageWrap', {static: false}) packageWrap: ElementRef;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private service: CreatePitchCardService,
        private cardPackageService: CardPackageService,
        private deviceService: DeviceDetectorService,
        private storageService: StorageService,
        private newBillingService: NewBillingService,
        private businessService: BusinessService,
        private pixel: PixelService
    ) {
        this.pixel.track('AddPaymentInfo', {
            content_name: 'Set up Billing'
        });
    }

    ngOnInit(): void {
        this.getBillingInfo();
        this.getPaymentPlan();
        this.onRouteChange();
        this.isMobile = this.deviceService.isMobile();
    }

    ngAfterViewInit() {
        this.calculateMaxWidth();
    }

    ngOnDestroy() {
        this.$billingPageSubscription.unsubscribe();
    }

    getBillingInfo() {
      const businessType: PitchCardType =
        this.cardPackageService.selectedType;
      this.externalProductType = this.cardPackageService.externalProductType;
      if (businessType) {
        this.cardPackageService
          .getActivePricingByBusinessType(businessType)
          .subscribe((r) => {
            this.pricingProducts = r.data;
            this.newBillingService.activePricingProducts = r.data;
            this.createCardInfo(businessType);
          });
      } else {
            this.createCardInfo();
        }
        if (this.externalProductType) {
          this.cardPackageService
            .getActivePricingByBusinessType(this.externalProductType)
            .subscribe((r) => {
              this.pricingProducts = r.data;
              this.newBillingService.activePricingProducts = r.data;
            });
        }
    }

    createCardInfo(businessType?) {
        this.selectedPackage = this.cardPackageService.getSelectedPackage();
        if (!this.selectedPackage) {
          this.selectedPackage = JSON.parse(
            this.storageService.getItem('selectedPackage')
          );
        }
        if (!this.selectedPackage && businessType) {
          this.selectedPackage = this.cardPackageService
            .getCardPackages()
            .find((p) => p.type === businessType);
        }
        if (businessType) {
            this.cardPackageService.getMockOfPCs().map((pc, index) => {
              if (
                pc.businessType === businessType ||
                pc.businessType === this.selectedPackage?.type
              ) {
                this.businessDetails = pc;
                this.storageService.setItem(
                  'selectedPackage',
                  this.selectedPackage
                );
                this.cardDescription =
                  this.cardPackageService.getPackageDescription()[index];
                this.calculateMaxWidth();
              }
            });
        }
    }

    calculateMaxWidth() {
        if (this.packageWrap && this.packageWrap.nativeElement) {
          this.packageWrap.nativeElement.style.maxWidth =
            360 * this.scaleFactor + 'px';
        }
    }

    getPaymentPlan() {
      this.newBillingService.draftBusinessId = JSON.parse(
        this.storageService.getSession(AppSettings.DRAFT_BUSINESS_ID)
      );
      if (this.newBillingService.draftBusinessId) {
        this.$billingPageSubscription.add(
          this.businessService
            .getPaymentPlan(this.newBillingService.draftBusinessId)
            .subscribe((r) => {
              if (r.data) {
                this.newBillingService.$paymentPlan.next(r.data);
              }
            })
        );
        }
    }

    onRouteChange() {
      this.$billingPageSubscription.add(
        this.router.events.subscribe((event) => {
          if (event instanceof NavigationStart) {
            this.isVirtualVideoPage =
              event.url.includes('virtual-video');
          }
        })
      );
    }

    showCalendar(calendarLink) {
        if (calendarLink.includes('calendly')) {
          Calendly.showPopupWidget(calendarLink, null, {
            parentElement: document.getElementsByClassName(
              'banner-search-wrap container'
            )[0]
          });
          return false;
        } else {
          window.open(calendarLink, '_blank');
        }
    }

    handleConfirmedSelection() {
        this.confirmedSelection = !this.confirmedSelection;
    }

    getBusinessTypeValue(type: string) {
        return this.cardPackageService.getBusinessTypeValue(type);
    }

    getBillingDescription(type: string) {
        return this.cardPackageService.getBillingDescription(type);
    }
}
