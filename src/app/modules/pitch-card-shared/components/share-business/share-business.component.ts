import {
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { SmsReferralModel } from '../../../shared/models/sms-referral.model';
import { BusinessService } from '../../../business/services/business.service';
import { AppConstantService } from '../../../shared/services/app-constant.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { AppSettings } from '../../../shared/app.settings';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { CreatePitchCardService } from '../../../create-pitch-card/create-pitch-card.service';
import { AnalyticsOptionsEnum } from '../../../choosen-history/pages/employer-portal/enums/analytics-options.enum';
import { PitchCardType } from '../../../shared/enums/pitch-card-type.enum';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BusinessStatus } from '../../../business/enums/business.status';
import { IntroTextOptions } from '../../../creation-tiles-shared/components/enter-information/text-introduction/text-introduction.component';

@Component({
  selector: 'app-share-business',
  templateUrl: './share-business.component.html',
  styleUrls: ['./share-business.component.scss']
})
export class ShareBusinessComponent implements OnInit, OnDestroy {
  @ViewChild('inputmask') inputMaskRef: any;
  @Input() shareUrl = '';
  @Input() introTextOptions: IntroTextOptions;
  @Input() businessType: PitchCardType;
  @Input() businessId: string;
  @Input() isPocketSharing: boolean = false;

  @Input()
  set inputStatus(status: BusinessStatus) {
    this.status = status ? status : BusinessStatus.Active;
  }

  autoFocus = true;
  shareSms = false;
  submittedSms = false;
  isMobile = this.dds.isMobile();
  isAvailableIntroduction: boolean;
  smsReferralModel = new SmsReferralModel();
  isBrowser;
  isPlatformServer;
  service;
  contactForm: FormGroup;
  analytics = AnalyticsOptionsEnum;
  status: BusinessStatus;

  $resetCommonShareDialog: Subscription;
  $analyticsSub = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private businessService: BusinessService,
    private createPitchCardService: CreatePitchCardService,
    private dds: DeviceDetectorService,
    @Inject(PLATFORM_ID) private platformId
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.autoFocus = true;
    if (this.isBrowser) {
      this.contactForm = this.formBuilder.group({
        contactNumber: [null]
      });
      this.resetCommonShareReferDialog();
    } else {
      // added empty for server side
      this.contactForm = this.formBuilder.group({
        contactNumber: new FormControl()
      });
    }
    const {isEnabledIntroText} = this.introTextOptions;
    this.isAvailableIntroduction =
      this.isMobile &&
      isEnabledIntroText &&
      this.status === BusinessStatus.Active;
    this.parseIntroText();
  }

  ngOnDestroy() {
    if (this.$resetCommonShareDialog) {
      this.$resetCommonShareDialog.unsubscribe();
    }
    if (this.$analyticsSub) {
      this.$analyticsSub.unsubscribe();
    }
  }

  parseIntroText() {
    const {name, companyName} = this.introTextOptions;
    let {introText} = this.introTextOptions;
    if (
      introText.includes('<strong>Name</strong>') ||
      introText.includes('<strong>Organization Name</strong>') ||
      introText.includes('<strong>Company Name</strong>')
    ) {
      introText = this.createPitchCardService.encodeExistIntroText({
        companyName,
        name,
        template: introText
      });
    }
    this.introTextOptions.introText =
      this.createPitchCardService.extractHtmlContent(introText);
  }

  showSms(isSmsIntro: boolean) {
    if (this.isBrowser) {
      const userAgent = navigator.userAgent || navigator.vendor;

      const {extraPhoneNumber, introText} = this.introTextOptions
        ? this.introTextOptions
        : {extraPhoneNumber: null, introText: null};

      if (
        userAgent.match(/iPad/i) ||
        userAgent.match(/iPhone/i) ||
        userAgent.match(/iPod/i)
      ) {
        const a: any = document.createElement('a');
        const encoded = encodeURIComponent(
          introText && this.isAvailableIntroduction && isSmsIntro
            ? introText + '\n' + '\n' + this.shareUrl
            : this.shareUrl
        );
        a.href = `sms:${
          extraPhoneNumber && this.isAvailableIntroduction
            ? '+1' + extraPhoneNumber + ','
            : ''
        }&body=${encoded}`;
        a.click();
      } else if (userAgent.match(/Android/i)) {
        const a: any = document.createElement('a');
        const encoded = encodeURIComponent(
          introText && this.isAvailableIntroduction && isSmsIntro
            ? introText + '\n' + '\n' + this.shareUrl
            : this.shareUrl
        );
        a.href = `sms:${
          extraPhoneNumber && this.isAvailableIntroduction
            ? '+1' + extraPhoneNumber
            : ''
        }?body=${encoded}`;
        a.click();
      } else {
        this.shareSms = true;
        setTimeout(() => {
          const inputMaskRef: any = this.inputMaskRef;
          if (
            inputMaskRef.el &&
            inputMaskRef.el.nativeElement &&
            inputMaskRef.el.nativeElement.children[0]
          ) {
            inputMaskRef.el.nativeElement.children[0].focus();
          }
        }, 300);
      }
    }
  }

  get form() {
    return this.contactForm.controls;
  }

  sendSMSToReferral() {
    if (this.contactForm.invalid) {
      this.submittedSms = true;
      return;
    }
    this.submittedSms = false;
    this.smsReferralModel.contactNumber =
      this.contactForm.controls.contactNumber.value;
    this.smsReferralModel.websiteLink = this.shareUrl;
    this.businessService
      .inviteReferralBySendingSMS(this.smsReferralModel)
      .subscribe(
        (res) => {
          this.shareSms = false;
          this.contactForm.reset();
          this.shareSocialMediaAnalytics(
            AnalyticsOptionsEnum.ShareText
          );
          this.smsReferralModel.contactNumber = '';
        },
        (error) => {
        }
      );
  }

  shareSocialMediaAnalytics(analyticsId) {
    this.$analyticsSub.add(
      this.businessService
        .shareSocialMediaAnalytics(
          this.businessId ? [this.businessId] : [],
          analyticsId
        )
        .subscribe(() => {
        })
    );
  }

  onHideShareSmsDialog(event) {
    this.shareSms = false;
    this.submittedSms = false;
    this.contactForm.get('contactNumber').setValidators([]);
    this.contactForm.get('contactNumber').updateValueAndValidity();
    this.contactForm.reset();
  }

  resetCommonShareReferDialog() {
    this.$resetCommonShareDialog =
      AppConstantService.resetCommonShareDialog.subscribe((data: any) => {
        if (data) {
          this.onHideShareSmsDialog(event);
        }
      });
  }

  saveQrCode(qrcode) {
    if (qrcode && qrcode.el) {
      const parentElement =
        qrcode.el.nativeElement.querySelector('img').src;

      // converts base 64 encoded image to blobData
      const blobData = this.convertBase64ToBlob(parentElement);

      // saves as image
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blobData, 'Qrcode');
      } else {
        // chrome
        const blob = new Blob([blobData], {type: 'image/png'});
        const url = window.URL.createObjectURL(blob);
        // window.open(url);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Qrcode';
        link.click();
        this.shareSocialMediaAnalytics(
          AnalyticsOptionsEnum.ShareQRCode
        );
      }
    }
  }

  formatPhoneNumber(str) {
    this.contactForm
      .get('contactNumber')
      .setValidators([
        Validators.required,
        Validators.pattern(AppSettings.US_PHONE_PATTERN)
      ]);
    this.contactForm.get('contactNumber').updateValueAndValidity();
    if (str?.length >= 10) {
      this.contactForm
        .get('contactNumber')
        .patchValue(this.createPitchCardService.formatPhoneNumber(str));
    }
  }

  private convertBase64ToBlob(Base64Image: any) {
    // SPLIT INTO TWO PARTS
    const parts = Base64Image.split(';base64,');
    // HOLD THE CONTENT TYPE
    const imageType = parts[0].split(':')[1];
    // DECODE BASE64 STRING
    const decodedData = window.atob(parts[1]);
    // CREATE UNIT8ARRAY OF SIZE SAME AS ROW DATA LENGTH
    const uInt8Array = new Uint8Array(decodedData.length);
    // INSERT ALL CHARACTER CODE INTO UINT8ARRAY
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i);
    }
    // RETURN BLOB IMAGE AFTER CONVERSION
    return new Blob([uInt8Array], {type: imageType});
  }
}
