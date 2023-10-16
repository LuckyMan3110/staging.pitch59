import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../../shared/services/storage.service';
import { Subscription } from 'rxjs';
import { CardPackageService } from '../../../cards-packages/services/card-package.service';
import { NewBillingService } from '../../services/new-billing.service';
import { PricingProduct } from '../../model/pricing-product';
import { UiService } from '../../../shared/services/ui.service';
import { BusinessService } from '../../../business/services/business.service';
import { AppSettings } from '../../../shared/app.settings';

declare const Calendly: any;

@Component({
  selector: 'app-visual-video',
  templateUrl: './virtual-video.component.html',
  styleUrls: ['./virtual-video.component.scss']
})
export class VirtualVideoComponent implements OnInit, OnDestroy {
  calendlyLink = AppSettings.calendlyVirtualVideoShootLink;
  virtualVideoExplanation: boolean = false;
  scheduled;
  paymentPlan: any;
  virtualVideoData: PricingProduct;
  resultPriceOfProduct: number | string;

  virtualVideoSubscription = new Subscription();

  constructor(
    private router: Router,
    private storageService: StorageService,
    private cardPackageService: CardPackageService,
    private newBillingService: NewBillingService,
    private uiService: UiService,
    private businessService: BusinessService
  ) {
  }

  ngOnInit(): void {
    this.getVirtualVideoProduct();
    this.initPaymentPlanObject();
  }

  ngOnDestroy() {
    document.removeEventListener('message', this.scheduled, false);
    if (this.virtualVideoSubscription) {
      this.virtualVideoSubscription.unsubscribe();
    }
  }

  getVirtualVideoProduct() {
    this.virtualVideoSubscription.add(
      this.cardPackageService
        .getActivePricingByBusinessType('virtualVideo')
        .subscribe((r) => {
          this.virtualVideoData = r.data[0];
          this.resultPriceOfProduct = (
            this.virtualVideoData.price -
            this.virtualVideoData.referralDiscount
          ).toFixed(
            this.virtualVideoData.price -
            this.virtualVideoData.referralDiscount >=
            1
              ? 0
              : 2
          );
        })
    );
  }

  initPaymentPlanObject() {
    if (!this.newBillingService.draftBusinessId) {
      this.paymentPlan = JSON.parse(
        this.storageService.getItem(AppSettings.PAYMENT_PLAN)
      );
    } else {
      this.virtualVideoSubscription.add(
        this.businessService
          .getPaymentPlan(this.newBillingService.draftBusinessId)
          .subscribe((r) => {
            if (r.data) {
              this.paymentPlan = r.data;
            }
          })
      );
    }
  }

  goToPage(path) {
    this.router.navigate([path]);
  }

  submitPaymentPlan(link, isVirtualVideo) {
    if (this.newBillingService.draftBusinessId) {
      this.virtualVideoSubscription.add(
        this.businessService
          .addUpdateBusinessPaymentPlan(
            this.newBillingService.draftBusinessId,
            this.populatePaymentPlanData(isVirtualVideo)
          )
          .subscribe(
            (r) => {
              this.uiService.successMessage(r.message);
              this.goToPage(link);
            },
            (e) => this.uiService.errorMessage(e.message)
          )
      );
    } else {
      this.storageService.setItem(
        AppSettings.PAYMENT_PLAN,
        this.populatePaymentPlanData(isVirtualVideo)
      );
      this.goToPage(link);
    }
  }

  populatePaymentPlanData(value) {
    return {
      paymentFrequency: this.paymentPlan.paymentFrequency,
      referralEmail: this.paymentPlan.referralEmail,
      virtualVideo: value,
      type: this.paymentPlan.type
    };
  }

  setVirtualVideo(link: string, isVirtualVideo: boolean, calendlyLink?) {
    if (calendlyLink && calendlyLink.includes('calendly')) {
      this.showCalendly(calendlyLink).then(() => {
        this.handleSubmitEventFromCalendly(link, isVirtualVideo);
      });
      return false;
    } else {
      this.submitPaymentPlan(link, isVirtualVideo);
    }
  }

  showCalendly(calendarLink) {
    return new Promise<void>((resolve, reject) => {
      Calendly.showPopupWidget(calendarLink, null, {
        parentElement: document.getElementsByClassName('content')[0]
      });
      resolve();
    });
  }

  handleSubmitEventFromCalendly(link, isVirtualVideo) {
    this.scheduled = window.addEventListener('message', (e) => {
      if (e.data.event === 'calendly.event_scheduled') {
        this.storageService.setItem(
          AppSettings.HAS_VIRTUAL_VIDEO,
          true
        );
        Calendly.closePopupWidget();
        this.submitPaymentPlan(link, isVirtualVideo);
      }
    });
  }

  handleVirtualVideoExplanation() {
    this.virtualVideoExplanation = !this.virtualVideoExplanation;
  }
}
