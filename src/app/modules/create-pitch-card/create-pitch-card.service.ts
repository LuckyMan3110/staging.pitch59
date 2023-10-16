import { Injectable } from '@angular/core';
import { forkJoin, Observable, Subject } from 'rxjs';
import { BusinessDetails } from '../business/models/business-detail.model';
import { StorageService } from '../shared/services/storage.service';
import { BusinessService } from '../business/services/business.service';
import { AppSettings } from '../shared/app.settings';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { map } from 'rxjs/operators';
import { UserCommonService } from '../shared/services/user-common.service';
import { CardDetailModel } from '../shared/models/card-detail.model';
import { BusinessBillingAddress } from '../business/models/business-billing-address.model ';
import { CustomerAnalyticsService } from '../choosen-history/services/customer-analytics.service';
import { Router } from '@angular/router';
import { CardPackageService } from '../cards-packages/services/card-package.service';
import { PitchCardType } from '../shared/enums/pitch-card-type.enum';
import { EducationLevel } from '../business/enums/education-level.enum';
import { BankDetailModel } from '../bank-details/models/bank-detail.model';
import { BusinessBankService } from '../shared/services/business-bank.service';
import { PaymentPlanModel } from '../business/models/paymnent-plan.model';
import { BusinessStatus } from '../business/enums/business.status';
import { FolderContentRole } from '../choosen-history/enums/folder-content-role.enum';
import { DefaultCityStateEnum } from '../shared/enums/default-citystate.enum';
import { BillingFrequency } from '../new-billing/services/new-billing.service';
import { OrganizationModel } from '../choosen-history/pages/employer-portal/models/organization-model';

export enum Step {
  Information = 1,
  Images = 2,
  Video = 3,
  MoreInfo = 4,
  Radius = 5,
  Billing = 6,
  Other = 7,
  Admins = 8,
  Analytics = 9,
  Employment = 10,
  Preview = 11,
  Position = 12
}

export class StepInfo {
  step: Step;
  completed: boolean;
  visited: boolean;
  errors: boolean;
}

export class CheckoutItem {
  name: string;
  description: string;
  active: boolean;
  amount: number;
}

@Injectable()
export class CreatePitchCardService {
  public loaded: boolean;

  private _currentStep: Step = Step.Information;

  public moveToStep: Step = Step.Information;

  public business: BusinessDetails;

  public businessId: any;

  public $stepsUpdate: Subject<boolean> = new Subject<boolean>();

  public $businessUpdated: Subject<boolean> = new Subject<boolean>();

  public $finish: Subject<boolean> = new Subject<boolean>();

  public $validateSection: Subject<Step> = new Subject<Step>();

  public $sectionSaved: Subject<Step> = new Subject<Step>();

  public $draftBusinessUpdated: Subject<BusinessDetails> =
    new Subject<BusinessDetails>();

  public $switchFromImages: Subject<any> = new Subject<any>();

  public $paymentApproveModal: Subject<any> = new Subject<any>();

  public $autofillModalSubject: Subject<any> = new Subject<any>();

  public displayCustom: boolean = false;

  public finished: boolean; //finished button clicked

  public steps: StepInfo[] = [];

  public states: any[];

  public cardDetail: CardDetailModel;

  public bankDetail: BankDetailModel;

  public billingAddress: BusinessBillingAddress;

  public paymentFrequency: any;

  private defaultRadius = 25;

  public draftBusiness: BusinessDetails;

  public paymentPlan: PaymentPlanModel;

  public isAppPayment: boolean = false;

  public isAllCompleted: boolean = true;

  public tileRequiredState: boolean = false;

  public tileFormGroup: FormGroup;

  public nextPaymentDate: number;

  public salesVideo: string;

  public visitObject;

  public lastSectionIndex: number | Step = 3; //TO-DO: change index after creating preview tile;

  public get guidelinesAccepted() {
    return this.storageService.getItem(
      AppSettings.SALES_VIDEO_GUIDELINES_ACCEPTED,
      true
    ) as any;
  }

  public set guidelinesAccepted(value) {
    this.storageService.setItem(
      AppSettings.SALES_VIDEO_GUIDELINES_ACCEPTED,
      value
    );
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public storageService: StorageService,
    private customerAnalyticsService: CustomerAnalyticsService,
    private cardPackageService: CardPackageService,
    public userCommonService: UserCommonService,
    private businessBankService: BusinessBankService,
    public businessService: BusinessService
  ) {
    this.draftBusiness = new BusinessDetails();
  }

  private setupSteps(): StepInfo[] {
    switch (this.businessType) {
      case PitchCardType.Resume: {
        return this.setupStepsResume();
      }
      case PitchCardType.Job: {
        return this.setupStepsJob();
      }
      case PitchCardType.Service:
      case PitchCardType.Employee: {
        return this.setupStepsService();
      }
      default: {
        return this.setupStepsDefault();
      }
    }
  }

  getVisitArray() {
    if (this.businessId && this.visitObject) {
      if (this.visitObject[this.businessId]) {
        return this.visitObject[this.businessId];
      }
    }
    return [];
  }

  private setupStepsResume(): StepInfo[] {
    const visitArray = this.getVisitArray();
    return [
      {
        step: Step.Information,
        completed: false,
        visited: !!visitArray.includes(Step.Information),
        errors: false
      },
      {
        step: Step.MoreInfo,
        completed: false,
        visited: !!visitArray.includes(Step.MoreInfo),
        errors: false
      },
      {
        step: Step.Radius,
        completed: false,
        visited: !!visitArray.includes(Step.Radius),
        errors: false
      },
      {
        step: Step.Employment,
        completed: false,
        visited: !!visitArray.includes(Step.Employment),
        errors: false
      },
      {
        step: Step.Images,
        completed: false,
        visited: !!visitArray.includes(Step.Images),
        errors: false
      },
      {
        step: Step.Video,
        completed: false,
        visited: !!visitArray.includes(Step.Video),
        errors: false
      }
    ];
  }

  setupStepsJob(): StepInfo[] {
    const visitArray = this.getVisitArray();
    return [
      {
        step: Step.Information,
        completed: false,
        visited: !!visitArray.includes(Step.Information),
        errors: false
      },
      {
        step: Step.MoreInfo,
        completed: false,
        visited: !!visitArray.includes(Step.MoreInfo),
        errors: false
      },
      {
        step: Step.Images,
        completed: false,
        visited: !!visitArray.includes(Step.Images),
        errors: false
      },
      {
        step: Step.Video,
        completed: false,
        visited: !!visitArray.includes(Step.Video),
        errors: false
      },
      {
        step: Step.Position,
        completed: false,
        visited: !!visitArray.includes(Step.Position),
        errors: false
      }
    ];
  }

  private setupStepsService(): StepInfo[] {
    const visitArray = this.getVisitArray();
    return [
      {
        step: Step.Billing,
        completed: false,
        visited: !!visitArray.includes(Step.Billing),
        errors: false
      },
      {
        step: Step.Information,
        completed: false,
        visited: !!visitArray.includes(Step.Information),
        errors: false
      },
      {
        step: Step.MoreInfo,
        completed: false,
        visited: !!visitArray.includes(Step.MoreInfo),
        errors: false
      },
      {
        step: Step.Images,
        completed: false,
        visited: !!visitArray.includes(Step.Images),
        errors: false
      },
      {
        step: Step.Video,
        completed: false,
        visited: !!visitArray.includes(Step.Video),
        errors: false
      }
    ];
  }

  private setupStepsDefault(): StepInfo[] {
    const visitArray = this.getVisitArray();
    return [
      {
        step: Step.Billing,
        completed: false,
        visited: !!visitArray.includes(Step.Billing),
        errors: false
      },
      {
        step: Step.Information,
        completed: false,
        visited: !!visitArray.includes(Step.Information),
        errors: false
      },
      {
        step: Step.MoreInfo,
        completed: false,
        visited: !!visitArray.includes(Step.MoreInfo),
        errors: false
      },
      {
        step: Step.Radius,
        completed: false,
        visited: !!visitArray.includes(Step.Radius),
        errors: false
      },
      {
        step: Step.Images,
        completed: false,
        visited: !!visitArray.includes(Step.Images),
        errors: false
      },
      {
        step: Step.Video,
        completed: false,
        visited: !!visitArray.includes(Step.Video),
        errors: false
      }
    ];
  }

  get currentStep(): Step | number {
    return this._currentStep;
  }

  get CurrentStepIndex() {
    return this.setupStepper().findIndex(
      (x) => x.value == this._currentStep
    );
  }

  set currentStep(val) {
    this._currentStep = val;
    this.moveToStep = val;
    this.$stepsUpdate.next(true);
  }

  get businessType() {
    return this.cardPackageService.selectedType;
  }

  set businessType(value: PitchCardType) {
    this.cardPackageService.selectedType = value;
  }

  getBusinessInfo() {
    return this.business;
  }

  updateDraftBusiness(value: Partial<BusinessDetails | OrganizationModel>) {
    if (!Object.keys(this.draftBusiness).length) {
      Object.assign(value, {businessType: this.businessType});
    }

    Object.assign(this.draftBusiness, value);
    this.$draftBusinessUpdated.next(this.draftBusiness);
  }

  getCheckout(): any {
    return this.businessService.getCheckout(this.businessId).pipe(
      map((x) => {
        return x.data;
      })
    );
  }

  clearPitchCardType() {
    this.businessType = null;
  }

  clearDraftBusiness() {
    this.storageService.setSession(AppSettings.DRAFT_BUSINESS_ID, null);
    this.userCommonService.createOrEdit();
  }

  setComponentRestrictions() {
    const componentRestrictions: any = {country: 'US'};

    return componentRestrictions;
  }

  initBusiness() {
    this.loaded = false;
    this.businessId = this.storageService.getSession(
      AppSettings.DRAFT_BUSINESS_ID
    ) as any;
    const draftUserId = this.storageService.getItem(
      AppSettings.DRAFT_USER_ID,
      true
    ) as any;
    const currentUserId = this.storageService.getUserId();
    if (
      !this.storageService.getItem(
        AppSettings.VISITED_TILES_STORAGE,
        false
      ) ||
      this.storageService.getItem(
        AppSettings.VISITED_TILES_STORAGE,
        false
      ) === 'null'
    ) {
      this.visitObject = {[this.businessId]: []};
    }
    if (draftUserId && draftUserId !== currentUserId) {
      this.businessId = null;
    }

    if (this.businessId && this.businessId !== 'null') {
      forkJoin([
        this.businessService.getBusinessDetail(this.businessId),
        this.userCommonService.getStates(),
        this.customerAnalyticsService.getSalesVideo(),
        // this.businessBankService.getBankAccountDetails(this.businessId), // TODO: get bankDetail receive issue
        this.businessService.getPaymentPlan(this.businessId)
      ]).subscribe(
        ([business, states, salesVideo, paymentPlan]) => {
          // TODO: get bankDetail receive issue
          this.business = business.data;
          this.businessType = this.business.businessType;
          this.draftBusiness = this.business;
          this.cardDetail =
            this.business.cardDetails &&
            this.business.cardDetails.find(
              (x) => x.isDefaultCard || x.type == 'CardConnect'
            );
          // this.bankDetail = bankDetail.data; // TODO: get bankDetail receive issue
          this.salesVideo = salesVideo.data;
          if (paymentPlan.data) {
            this.paymentPlan = paymentPlan.data.notPaid
              ? paymentPlan.data.notPaid
              : paymentPlan.data.paid;
            this.nextPaymentDate = paymentPlan.data?.paid
              ?.nextPaymentDate
              ? paymentPlan.data.paid.nextPaymentDate
              : null;
            this.isAppPayment = paymentPlan.data?.notPaid
              ? paymentPlan.data.notPaid.isAppPaymentPlan
              : false;
          }
          this.updateDraftBusiness(business.data);
          this.states = this.setDropDown(
            states.data,
            'stateCode',
            'id'
          );
          this.validateAllSteps();
          this.loaded = true;
          this.$businessUpdated.next();
          this.$autofillModalSubject.next(true);
        },
        (err) => {
          this.storageService.setSession(
            AppSettings.DRAFT_BUSINESS_ID,
            null
          );
          this.initBusiness();
        }
      );
    } else {
      this.businessId = null;
      this.businessType = this.storageService.getSession(
        AppSettings.DRAFT_PITCH_CARD_TYPE
      );
      if (this.businessType !== PitchCardType.Resume) {
        this.router.navigate(['pricing']);
        return;
      }
      forkJoin([
        this.userCommonService.getStates(),
        this.customerAnalyticsService.getSalesVideo()
      ]).subscribe(([states, salesVideo]) => {
        this.business = new BusinessDetails();
        this.draftBusiness = this.business;
        this.cardDetail = null;
        this.bankDetail = null;
        this.business.businessType =
          this.cardPackageService.selectedType;
        this.salesVideo = salesVideo.data;
        this.states = this.setDropDown(states.data, 'stateCode', 'id');
        this.loaded = true;
        this.$businessUpdated.next();
        this.validateAllSteps();
      });
    }
    this.steps = this.setupSteps();
  }

  validateAllSteps() {
    this.setupStepper().forEach((step, index) => {
      if (step.value === Step.Billing) {
        this.steps[index].completed =
          !!this.cardDetail ||
          !!this.bankDetail ||
          !!this.isAppPayment;
        this.steps[index].visited =
          !!this.cardDetail || !!this.bankDetail;
      } else {
        this.steps[index].completed = this.getBusinessForm(
          step.value
        ).valid;
        const visitedArray = this.markFormGroupTouched(
          this.getBusinessForm(step.value)
        );
        const visitedStorage = JSON.parse(
          this.storageService.getItem(
            AppSettings.VISITED_TILES_STORAGE,
            true
          )
        );
        if (
          visitedStorage &&
          visitedStorage.hasOwnProperty(this.businessId) &&
          visitedStorage[this.businessId].includes(step.value)
        ) {
          this.steps[index].visited = true;
        } else {
          this.steps[index].visited =
            visitedArray.length > 0 &&
            this.getBusinessForm(step.value).valid;
        }
      }
    });
    this.$stepsUpdate.next();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    const accArray = [];
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.controls[key];
      const validator = control.validator
        ? control.validator({} as AbstractControl)
        : null;
      if (validator && validator.required) {
        accArray.push(control);
      }
    });
    return accArray;
  }

  closeGalleria() {
    this.$switchFromImages.next();
  }

  setDropDown(src, labelKey, valueKey?) {
    const dest = src.map((elm) => {
      return {
        label: elm[labelKey],
        value: valueKey ? elm[valueKey] : elm,
        elm: elm
      };
    });
    return dest;
  }

  formatPhoneNumber(str) {
    const cleaned = ('' + str).replace(/\D/g, '');

    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return str;
  }

  updateBusiness(value) {
    Object.assign(value, {businessType: this.businessType});
    Object.assign(this.business, value);
  }

  updateAndChangeStep(value): Observable<any> {
    Object.assign(value, {businessType: this.businessType});

    if (this.businessId && this.businessId !== 'null') {
      return this.businessService
        .updateBusinessByIndividualParameters(this.businessId, value)
        .pipe(
          map((result) => {
            this.storageService.setSession(
              AppSettings.DRAFT_BUSINESS_ID,
              result.data.id
            );
            this.business = result.data;
            this.cardDetail =
              this.business.cardDetails &&
              this.business.cardDetails.find(
                (x) => x.isDefaultCard
              );
            this.updateDraftBusiness(result.data);
            this.currentStep = this.moveToStep;
          })
        );
    } else {
      return this.businessService
        .addBusinessByBillingAndPaymentPlan(
          this.populateRequestObject(value)
        )
        .pipe(
          map((result) => {
            this.storageService.setSession(
              AppSettings.DRAFT_BUSINESS_ID,
              result.data.id
            );
            this.storageService.setItem(
              AppSettings.DRAFT_USER_ID,
              this.storageService.getUserId()
            );
            this.business = result.data;
            this.cardDetail =
              this.business.cardDetails &&
              this.business.cardDetails.find(
                (x) => x.isDefaultCard
              );
            this.updateDraftBusiness(result.data);
            this.businessId = result.data.id;
            this.currentStep = this.moveToStep;
            if (this.businessType === PitchCardType.Resume) {
              this.storageService.setItem(
                AppSettings.IS_RESUME_EXIST,
                true
              );
            }
          })
        );
    }
  }

  populateRequestObject(value) {
    return {
      businessType: PitchCardType.Resume,
      business: value,
      paymentPlanDto: {
        paymentFrequency: BillingFrequency.LifeTime,
        virtualVideo: false,
        discountCode: '',
        referralEmail: ''
      }
    };
  }

  saveChanges(): Observable<any> {
    const payload = {
      businessStatus: BusinessStatus.Pending,
      cardDetails: null,
      businessBillingAddress: this.billingAddress,
      businessType: this.businessType
    };
    Object.assign(this.business, payload);
    return this.businessService.updateBusinessByIndividualParameters(
      this.businessId,
      payload
    );
  }

  progress(): number {
    return this.steps.filter((x) => x.completed).length * 20;
  }

  isPreviewTileCompleted(): boolean {
    return (
      (100 / this.steps.length) * (this.steps.length - 1) <=
      (100 / this.steps.length) *
      this.steps.filter((x) => x.completed).length
    );
  }

  getCurrentStep(): Step {
    const steps = this.setupStepper();
    return steps[this.CurrentStepIndex].value;
  }

  getNextSection(): Step {
    const steps = this.setupStepper();
    if (this.CurrentStepIndex >= steps.length - 1) {
      return;
    } else {
      return steps[this.CurrentStepIndex + 1].value;
    }
  }

  changeCurrentSectionCompleted(completed: boolean) {
    if (this.steps[this.CurrentStepIndex]) {
      this.steps[this.CurrentStepIndex].completed = completed;
    }
    this.$stepsUpdate.next(true);
  }

  changeCurrentSectionVisited() {
    if (this.steps[this.CurrentStepIndex]) {
      this.steps[this.CurrentStepIndex].visited = true;
      this.$stepsUpdate.next(true);
      this.setObjectVisit();
    }
  }

  public setObjectVisit() {
    if (
      !this.storageService.getItem(
        AppSettings.VISITED_TILES_STORAGE,
        false
      ) ||
      this.storageService.getItem(
        AppSettings.VISITED_TILES_STORAGE,
        false
      ) === 'null'
    ) {
      this.visitObject = {};
      this.visitObject[this.businessId] = [
        this.steps[this.CurrentStepIndex].step
      ];
      this.storageService.setItem(
        AppSettings.VISITED_TILES_STORAGE,
        JSON.stringify(this.visitObject)
      );
    } else {
      this.visitObject = JSON.parse(
        this.storageService.getItem(
          AppSettings.VISITED_TILES_STORAGE,
          true
        )
      );
      if (this.visitObject[this.businessId]) {
        if (
          !this.visitObject[this.businessId].includes(
            this.steps[this.CurrentStepIndex].step
          )
        ) {
          this.visitObject[this.businessId].push(
            this.steps[this.CurrentStepIndex].step
          );
        }
      } else {
        this.visitObject[this.businessId] = [
          this.steps[this.CurrentStepIndex].step
        ];
      }
      this.storageService.setItem(
        AppSettings.VISITED_TILES_STORAGE,
        JSON.stringify(this.visitObject)
      );
    }
  }

  getNextSectionRoute() {
    const step = this.getNextSection();
    return this.getSectionRoute(step);
  }

  getPrevSectionRoute() {
    const step = this.getPrevSection();
    return this.getSectionRoute(step);
  }

  get IsLastSection() {
    if (this.steps.length) {
      return this.currentStep === this.steps[this.steps.length - 1].step;
    }
  }

  getPrevSection() {
    const steps = this.setupStepper();
    if (this.CurrentStepIndex === 0) {
      return steps[this.CurrentStepIndex].value;
    } else {
      let i = 1;
      while (i <= this.CurrentStepIndex) {
        if (steps[this.CurrentStepIndex - i].completed) {
          return steps[this.CurrentStepIndex - i].value;
        }
        i++;
      }
      return steps[0].value;
    }
  }

  getSectionRoute(stepNumber: Step = this.currentStep): string {
    switch (stepNumber) {
      case Step.Information: {
        return 'create/information';
      }
      case Step.Images: {
        return 'create/images';
      }
      case Step.Video: {
        return 'create/video';
      }
      case Step.MoreInfo: {
        return 'create/more-info';
      }
      case Step.Radius: {
        return 'create/radius';
      }
      case Step.Billing: {
        return 'create/billing';
      }
      case Step.Employment: {
        return 'create/employment';
      }
      case Step.Preview: {
        return 'create/preview';
      }
      case Step.Position: {
        return 'create/position';
      }
    }
  }

  getBusinessInformation() {
    if (this.business) {
      if (this.business.city == DefaultCityStateEnum.city) {
        this.business.city = '';
      }
      if (this.business.state == DefaultCityStateEnum.state) {
        this.business.state = '';
      }
      if (this.business.alias) {
        this.business.alias = this.business.alias.split('?userId=')[0];
      }
      if (this.businessType === PitchCardType.Service) {
        let nameOne = this.business.businessName;
        let nameTwo = null;
        if (this.business?.businessName?.includes(' | ')) {
          nameOne = this.business.businessName.split(' | ')[0];
          nameTwo = this.business.businessName.split(' | ')[1];
        }
        return {
          businessType: [this.businessType, [Validators.required]],
          businessName: [
            nameOne,
            [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(35)
            ]
          ],
          secondBusinessName: [
            nameTwo,
            [Validators.minLength(3), Validators.maxLength(21)]
          ],
          title: [this.business.title, [Validators.maxLength(50)]],
          isHideTitle: [this.business.isHideTitle],
          alias: [
            this.business.alias || '',
            [Validators.required, Validators.minLength(3)]
          ],
          email: [
            this.business.email,
            [
              Validators.required,
              Validators.pattern(AppSettings.EMAIL_PATTERN)
            ]
          ],
          contactNumber: [
            this.business.contactNumber,
            [Validators.required]
          ],
          websiteLink: [this.business.websiteLink],
          address: [this.business.address, [Validators.required]],
          latitude: [this.business.latitude],
          longitude: [this.business.longitude],
          state: [this.business.state, [Validators.required]],
          city: [this.business.city, [Validators.required]],
          zip: [
            this.business.zip,
            [
              Validators.required,
              Validators.pattern(AppSettings.ZIPCODE_PATTERN)
            ]
          ],
          isHideAddress: [this.business.isHideAddress, []],
          reviewedAddress: [true],
          introductionOptions: this.getIntroOptions()
        };
      } else if (this.businessType === PitchCardType.Resume) {
        return {
          businessType: [this.businessType, [Validators.required]],
          businessName: [
            this.business.businessName,
            [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(35)
            ]
          ],
          isHideTitle: [this.business.isHideTitle],
          alias: [
            this.business.alias || '',
            [Validators.required, Validators.minLength(3)]
          ],
          email: [
            this.business.email,
            [
              Validators.required,
              Validators.pattern(AppSettings.EMAIL_PATTERN)
            ]
          ],
          contactNumber: [
            this.business.contactNumber,
            [Validators.required]
          ],
          address: [this.business.address, [Validators.required]],
          latitude: [this.business.latitude],
          longitude: [this.business.longitude],
          state: [this.business.state, [Validators.required]],
          city: [this.business.city, [Validators.required]],
          zip: [
            this.business.zip,
            [
              Validators.required,
              Validators.pattern(AppSettings.ZIPCODE_PATTERN)
            ]
          ],
          isHideAddress: [
            this.business.hasOwnProperty('isHideAddress')
              ? this.business.isHideAddress
              : true,
            []
          ],
          reviewedAddress: [true],
          introductionOptions: this.getIntroOptions()
        };
      } else if (this.businessType === PitchCardType.Employee) {
        return {
          businessType: [
            this.business.businessType,
            [Validators.required]
          ],
          businessName: [
            this.business.businessName,
            [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(35)
            ]
          ],
          title: [
            this.business.title,
            [Validators.required, Validators.maxLength(50)]
          ],
          isHideTitle: [this.business.isHideTitle],
          alias: [
            this.business.alias || '',
            [Validators.required, Validators.minLength(3)]
          ],
          email: [
            this.business.email,
            [
              Validators.required,
              Validators.pattern(AppSettings.EMAIL_PATTERN)
            ]
          ],
          contactNumber: [
            this.business.contactNumber,
            [Validators.required]
          ],
          websiteLink: [this.business.websiteLink],
          address: [this.business.address, [Validators.required]],
          latitude: [this.business.latitude],
          longitude: [this.business.longitude],
          state: [this.business.state, [Validators.required]],
          city: [this.business.city, [Validators.required]],
          zip: [
            this.business.zip,
            [
              Validators.required,
              Validators.pattern(AppSettings.ZIPCODE_PATTERN)
            ]
          ],
          isHideAddress: [this.business.isHideAddress, []],
          reviewedAddress: [true],
          introductionOptions: this.getIntroOptions()
        };
      } else {
        return {
          businessType: [
            this.business.businessType,
            [Validators.required]
          ],
          businessName: [
            this.business.businessName,
            [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(35)
            ]
          ],
          title: [this.business.title, [Validators.maxLength(50)]],
          isHideTitle: [this.business.isHideTitle],
          alias: [
            this.business.alias || '',
            [Validators.required, Validators.minLength(3)]
          ],
          email: [
            this.business.email,
            [
              Validators.required,
              Validators.pattern(AppSettings.EMAIL_PATTERN)
            ]
          ],
          contactNumber: [
            this.business.contactNumber,
            [Validators.required]
          ],
          websiteLink: [this.business.websiteLink],
          address: [this.business.address, [Validators.required]],
          latitude: [this.business.latitude],
          longitude: [this.business.longitude],
          state: [this.business.state, [Validators.required]],
          city: [this.business.city, [Validators.required]],
          zip: [
            this.business.zip,
            [
              Validators.required,
              Validators.pattern(AppSettings.ZIPCODE_PATTERN)
            ]
          ],
          isHideAddress: [this.business.isHideAddress, []],
          reviewedAddress: [true],
          introductionOptions: this.getIntroOptions()
        };
      }
    } else {
      if (this.businessType === PitchCardType.Service) {
        return {
          businessType: [this.businessType, [Validators.required]],
          businessName: [
            null,
            [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(35)
            ]
          ],
          secondBusinessName: [
            null,
            [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(21)
            ]
          ],
          title: [null, [Validators.maxLength(50)]],
          isHideTitle: [false],
          alias: [null, [Validators.required]],
          email: [
            null,
            [
              Validators.required,
              Validators.pattern(AppSettings.EMAIL_PATTERN)
            ]
          ],
          contactNumber: [null, [Validators.required]],
          websiteLink: [null],
          address: [null, [Validators.required]],
          latitude: [null, [Validators.required]],
          longitude: [null, [Validators.required]],
          state: [null, [Validators.required]],
          city: [null],
          zip: [
            null,
            [
              Validators.required,
              Validators.pattern(AppSettings.ZIPCODE_PATTERN)
            ]
          ],
          isHideAddress: [false, []],
          reviewedAddress: [false],
          introductionOptions: this.getIntroOptions()
        };
      } else if (this.businessType === PitchCardType.Resume) {
        return {
          businessType: [this.businessType, [Validators.required]],
          businessName: [
            null,
            [Validators.required, Validators.maxLength(35)]
          ],
          title: [
            null,
            [Validators.required, Validators.maxLength(50)]
          ],
          isHideTitle: [false],
          alias: [null, [Validators.required]],
          email: [
            null,
            [
              Validators.required,
              Validators.pattern(AppSettings.EMAIL_PATTERN)
            ]
          ],
          contactNumber: [null, [Validators.required]],
          websiteLink: [null],
          address: [null, [Validators.required]],
          latitude: [null, [Validators.required]],
          longitude: [null, [Validators.required]],
          state: [null, [Validators.required]],
          city: [null],
          zip: [
            null,
            [
              Validators.required,
              Validators.pattern(AppSettings.ZIPCODE_PATTERN)
            ]
          ],
          isHideAddress: [true, []],
          reviewedAddress: [false],
          introductionOptions: this.getIntroOptions()
        };
      } else {
        return {
          businessType: [this.businessType, [Validators.required]],
          businessName: [
            null,
            [Validators.required, Validators.maxLength(35)]
          ],
          title: [null, [Validators.maxLength(50)]],
          isHideTitle: [false],
          alias: [null, [Validators.required]],
          email: [
            null,
            [
              Validators.required,
              Validators.pattern(AppSettings.EMAIL_PATTERN)
            ]
          ],
          contactNumber: [null, [Validators.required]],
          websiteLink: [null],
          address: [null, [Validators.required]],
          latitude: [null, [Validators.required]],
          longitude: [null, [Validators.required]],
          state: [null, [Validators.required]],
          city: [null],
          zip: [
            null,
            [
              Validators.required,
              Validators.pattern(AppSettings.ZIPCODE_PATTERN)
            ]
          ],
          isHideAddress: [false, []],
          reviewedAddress: [false],
          introductionOptions: this.getIntroOptions()
        };
      }
    }
  }

  private getImages() {
    if (this.business) {
      if (this.businessType === PitchCardType.Resume) {
        return {
          businessType: [
            this.business.businessType,
            [Validators.required]
          ],
          employeePictureFileIds: [
            this.business.employeePictureFileIds
          ],
          employeePictureFileUrl: [
            this.business.employeePictureFileUrl
          ],
          employeePictureThumnailIds: [
            this.business.employeePictureThumnailIds
          ],
          employeePictureThumnailUrl: [
            this.business.employeePictureThumnailUrl
          ],
          videoCoverImageFileId: [
            this.business.videoCoverImageFileId,
            [Validators.required]
          ],
          videoCoverImageThumbnailId: [
            this.business.videoCoverImageThumbnailId
          ],
          videoCoverImageThumbnailUrl: [
            this.business.videoCoverImageThumbnailUrl
          ],
          resumeFileId: [
            this.business.resumeFileId,
            [Validators.required]
          ],
          resumeFileUrl: [
            this.business.resumeFileUrl,
            [Validators.required]
          ]
        };
      } else if (this.businessType === PitchCardType.Job) {
        return {
          businessType: [
            this.business.businessType,
            [Validators.required]
          ],
          videoCoverImageFileId: [
            this.business.videoCoverImageFileId,
            [Validators.required]
          ],
          videoCoverImageThumbnailId: [
            this.business.videoCoverImageThumbnailId
          ],
          videoCoverImageThumbnailUrl: [
            this.business.videoCoverImageThumbnailUrl
          ],
          businessLogoFilelId: [
            this.business.businessLogoFilelId,
            [Validators.required]
          ],
          businessLogoThumbnailId: [
            this.business.businessLogoThumbnailId
          ],
          businessLogoThumbnailUrl: [
            this.business.businessLogoThumbnailUrl
          ]
        };
      } else {
        return {
          businessType: [
            this.business.businessType,
            [Validators.required]
          ],
          employeePictureFileIds: [
            this.business.employeePictureFileIds
          ],
          employeePictureFileUrl: [
            this.business.employeePictureFileUrl
          ],
          employeePictureThumnailIds: [
            this.business.employeePictureThumnailIds
          ],
          employeePictureThumnailUrl: [
            this.business.employeePictureThumnailUrl
          ],
          videoCoverImageFileId: [
            this.business.videoCoverImageFileId,
            [Validators.required]
          ],
          videoCoverImageThumbnailId: [
            this.business.videoCoverImageThumbnailId
          ],
          videoCoverImageThumbnailUrl: [
            this.business.videoCoverImageThumbnailUrl
          ],
          businessLogoFilelId: [
            this.business.businessLogoFilelId,
            [Validators.required]
          ],
          businessLogoThumbnailId: [
            this.business.businessLogoThumbnailId
          ],
          businessLogoThumbnailUrl: [
            this.business.businessLogoThumbnailUrl
          ]
        };
      }
    } else {
    }
  }

  private getPitchVideo() {
    const videoFileUrl =
      this.business?.businessType === PitchCardType.Job
        ? AppSettings.jobPlaceholderVideoUrl
        : AppSettings.commonPlaceholderVideoUrl;
    const playbackId =
      this.business?.businessType === PitchCardType.Job
        ? AppSettings.jobPlaceholderPlaybackID
        : AppSettings.commonPlaceholderPlaybackID;
    const videoFileId =
      this.business?.businessType === PitchCardType.Job
        ? AppSettings.jobPlaceholderVideoID
        : AppSettings.commonPlaceholderVideoID;

    if (this.business) {
      return {
        videoFileId: [
          this.business?.videoFileId
            ? this.business.videoFileId
            : playbackId,
          Validators.required
        ],
        isMirrorVideo: [this.business.isMirrorVideo],
        videoFileUrl: [
          this.business?.videoFileUrl
            ? this.business.videoFileUrl
            : videoFileUrl
        ],
        videoThumbnailUrl: [
          this.business?.videoThumbnailUrl
            ? this.business.videoThumbnailUrl
            : 'https://image.mux.com/' +
            videoFileId +
            '/thumbnail.jpg?time=1'
        ]
      };
    } else {
      return {
        videoFileId: [videoFileId, Validators.required],
        isMirrorVideo: [false],
        videoFileUrl: [videoFileUrl],
        videoThumbnailUrl: [
          'https://image.mux.com/' + videoFileId + '/thumbnail.jpg'
        ]
      };
    }
  }

  private getPricingHours() {
    if (this.business) {
      if (this.businessType === 'resume') {
        return {
          websiteLink: [
            this.business.websiteLink,
            [Validators.pattern(AppSettings.WEBSITE_PATTERN)]
          ],
          facebookLink: [
            this.business.facebookLink,
            [
              Validators.pattern(
                AppSettings.UNSECURE_FACEBOOK_PATTERN
              )
            ]
          ],
          calendarLink: [
            this.business.calendarLink,
            [Validators.pattern(AppSettings.WEBSITE_PATTERN)]
          ],
          linkedinLink: [
            this.business.linkedinLink,
            [
              Validators.pattern(
                AppSettings.UNSECURE_LINKEDIN_PATTERN
              )
            ]
          ],
          instagramLink: [
            this.business.instagramLink,
            [
              Validators.pattern(
                AppSettings.UNSECURE_INSTAGRAM_PATTERN
              )
            ]
          ],
          twitterLink: [
            this.business.twitterLink,
            [
              Validators.pattern(
                AppSettings.UNSECURE_TWITTER_PATTERN
              )
            ]
          ],
          pinterestLink: [
            this.business.pinterestLink,
            [
              Validators.pattern(
                AppSettings.UNSECURE_PINTEREST_PATTERN
              )
            ]
          ],
          description: [this.business.pricingModel]
        };
      } else {
        const pricingModel = this.business.pricingModel;
        const businessHours = this.business.workingHours;
        let workingHours = [];
        let description = null;

        if (pricingModel) {
          description = pricingModel;
        }

        if (businessHours?.length) {
          workingHours = businessHours;
        } else if (
          this.visitObject?.hasOwnProperty(
            this?.business?.businessId
          ) &&
          !this.visitObject[this?.business?.businessId]?.includes(
            this.currentStep
          )
        ) {
          workingHours = [
            {
              SUN: new FormControl(false),
              MON: new FormControl(true),
              TUE: new FormControl(true),
              WED: new FormControl(true),
              THU: new FormControl(true),
              FRI: new FormControl(true),
              SAT: new FormControl(false),
              closeHours: new FormControl(17),
              closeMinutes: new FormControl(0),
              openHours: new FormControl(8),
              openMinutes: new FormControl(0)
            }
          ];
        }

        if (this.businessType === 'service') {
          return {
            facebookLink: [
              this.business.facebookLink,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_FACEBOOK_PATTERN
                )
              ]
            ],
            calendarLink: [
              this.business.calendarLink,
              [Validators.pattern(AppSettings.WEBSITE_PATTERN)]
            ],
            linkedinLink: [
              this.business.linkedinLink,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_LINKEDIN_PATTERN
                )
              ]
            ],
            instagramLink: [
              this.business.instagramLink,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_INSTAGRAM_PATTERN
                )
              ]
            ],
            twitterLink: [
              this.business.twitterLink,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_TWITTER_PATTERN
                )
              ]
            ],
            pinterestLink: [
              this.business.pinterestLink,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_PINTEREST_PATTERN
                )
              ]
            ],
            workingHours: [workingHours],
            description: [description]
          };
        } else if (this.businessType === 'job') {
          return {
            industries: [
              this.business.industries || [],
              Validators.required
            ],
            facebookLink: [
              this.business.facebookLink,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_FACEBOOK_PATTERN
                )
              ]
            ],
            calendarLink: [
              this.business.calendarLink,
              [Validators.pattern(AppSettings.WEBSITE_PATTERN)]
            ],
            linkedinLink: [
              this.business.linkedinLink,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_LINKEDIN_PATTERN
                )
              ]
            ],
            instagramLink: [
              this.business.instagramLink,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_INSTAGRAM_PATTERN
                )
              ]
            ],
            twitterLink: [
              this.business.twitterLink,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_TWITTER_PATTERN
                )
              ]
            ],
            pinterestLink: [
              this.business.pinterestLink,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_PINTEREST_PATTERN
                )
              ]
            ],
            description: [this.business.pricingModel]
          };
        } else {
          return {
            facebookLink: [
              this.business.facebookLink,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_FACEBOOK_PATTERN
                )
              ]
            ],
            calendarLink: [
              this.business.calendarLink,
              [Validators.pattern(AppSettings.WEBSITE_PATTERN)]
            ],
            linkedinLink: [
              this.business.linkedinLink,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_LINKEDIN_PATTERN
                )
              ]
            ],
            instagramLink: [
              this.business.instagramLink,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_INSTAGRAM_PATTERN
                )
              ]
            ],
            twitterLink: [
              this.business.twitterLink,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_TWITTER_PATTERN
                )
              ]
            ],
            pinterestLink: [
              this.business.pinterestLink,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_PINTEREST_PATTERN
                )
              ]
            ],
            workingHours: [workingHours],
            businessTags: [
              this.business.businessTags || [],
              [Validators.required]
            ],
            description: [description]
          };
        }
      }
    } else {
      if (this.businessType === 'resume') {
        return {
          facebookLink: [
            null,
            [
              Validators.pattern(
                AppSettings.UNSECURE_FACEBOOK_PATTERN
              )
            ]
          ],
          calendarLink: [
            null,
            [Validators.pattern(AppSettings.WEBSITE_PATTERN)]
          ],
          linkedinLink: [
            null,
            [
              Validators.pattern(
                AppSettings.UNSECURE_LINKEDIN_PATTERN
              )
            ]
          ],
          instagramLink: [
            null,
            [
              Validators.pattern(
                AppSettings.UNSECURE_INSTAGRAM_PATTERN
              )
            ]
          ],
          twitterLink: [
            null,
            [
              Validators.pattern(
                AppSettings.UNSECURE_TWITTER_PATTERN
              )
            ]
          ],
          pinterestLink: [
            null,
            [
              Validators.pattern(
                AppSettings.UNSECURE_PINTEREST_PATTERN
              )
            ]
          ],
          description: [null]
        };
      } else {
        if (this.businessType === 'service') {
          return {
            facebookLink: [
              null,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_FACEBOOK_PATTERN
                )
              ]
            ],
            calendarLink: [
              null,
              [Validators.pattern(AppSettings.WEBSITE_PATTERN)]
            ],
            linkedinLink: [
              null,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_LINKEDIN_PATTERN
                )
              ]
            ],
            instagramLink: [
              null,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_INSTAGRAM_PATTERN
                )
              ]
            ],
            twitterLink: [
              null,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_TWITTER_PATTERN
                )
              ]
            ],
            pinterestLink: [
              null,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_PINTEREST_PATTERN
                )
              ]
            ],
            workingHours: [
              {
                SUN: new FormControl(false),
                MON: new FormControl(true),
                TUE: new FormControl(true),
                WED: new FormControl(true),
                THU: new FormControl(true),
                FRI: new FormControl(true),
                SAT: new FormControl(false),
                closeHours: new FormControl(17),
                closeMinutes: new FormControl(0),
                openHours: new FormControl(8),
                openMinutes: new FormControl(0)
              }
            ],
            description: [null]
          };
        } else if (this.businessType === 'job') {
          return {
            industries: [[], Validators.required],
            facebookLink: [
              null,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_FACEBOOK_PATTERN
                )
              ]
            ],
            calendarLink: [
              null,
              [Validators.pattern(AppSettings.WEBSITE_PATTERN)]
            ],
            linkedinLink: [
              null,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_LINKEDIN_PATTERN
                )
              ]
            ],
            instagramLink: [
              null,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_INSTAGRAM_PATTERN
                )
              ]
            ],
            twitterLink: [
              null,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_TWITTER_PATTERN
                )
              ]
            ],
            pinterestLink: [
              null,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_PINTEREST_PATTERN
                )
              ]
            ],
            description: [null]
          };
        } else {
          return {
            facebookLink: [
              null,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_FACEBOOK_PATTERN
                )
              ]
            ],
            calendarLink: [
              null,
              [Validators.pattern(AppSettings.WEBSITE_PATTERN)]
            ],
            linkedinLink: [
              null,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_LINKEDIN_PATTERN
                )
              ]
            ],
            instagramLink: [
              null,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_INSTAGRAM_PATTERN
                )
              ]
            ],
            twitterLink: [
              null,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_TWITTER_PATTERN
                )
              ]
            ],
            pinterestLink: [
              null,
              [
                Validators.pattern(
                  AppSettings.UNSECURE_PINTEREST_PATTERN
                )
              ]
            ],
            workingHours: [
              {
                SUN: new FormControl(false),
                MON: new FormControl(true),
                TUE: new FormControl(true),
                WED: new FormControl(true),
                THU: new FormControl(true),
                FRI: new FormControl(true),
                SAT: new FormControl(false),
                closeHours: new FormControl(17),
                closeMinutes: new FormControl(0),
                openHours: new FormControl(8),
                openMinutes: new FormControl(0)
              }
            ],
            businessTags: [[], [Validators.required]],
            description: [null]
          };
        }
      }
    }
  }

  private getAdvertisingRadius() {
    if (this.business) {
      return {
        location: [],
        placeId: [this.business.placeId],
        latitude: [this.business.latitude, [Validators.required]],
        longitude: [this.business.longitude, [Validators.required]],
        radius: [
          this.business.radius || this.defaultRadius,
          [
            Validators.required,
            Validators.pattern(AppSettings.DIGIT_PATTERN)
          ]
        ]
      };
    } else {
      return {
        location: [null],
        placeId: [null],
        latitude: [0, [Validators.required]],
        longitude: [0, [Validators.required]],
        radius: [
          this.defaultRadius,
          [
            Validators.required,
            Validators.pattern(AppSettings.DIGIT_PATTERN)
          ]
        ]
      };
    }
  }

  private getBilling() {
    if (this.business) {
      if (this.business.businessBillingAddress) {
        if (this.business.useBillingAddress) {
          return {
            useBillingAddress: [!this.business.useBillingAddress],
            address: [
              {
                value: this.business.businessBillingAddress
                  .address,
                disabled: true
              }
            ],
            zip: [
              {
                value: this.business.businessBillingAddress.zip,
                disabled: true
              }
            ],
            city: [
              {
                value: this.business.businessBillingAddress
                  .city,
                disabled: true
              }
            ],
            state: [
              {
                value: this.business.businessBillingAddress
                  .state,
                disabled: true
              }
            ]
          };
        } else {
          return {
            useBillingAddress: [!this.business.useBillingAddress],
            address: [
              this.business.businessBillingAddress.address,
              [Validators.required]
            ],
            zip: [
              this.business.businessBillingAddress.zip,
              [Validators.required]
            ],
            city: [
              this.business.businessBillingAddress.city,
              [Validators.required]
            ],
            state: [
              this.business.businessBillingAddress.state,
              [Validators.required]
            ]
          };
        }
      } else {
        return {
          useBillingAddress: [!this.business.useBillingAddress],
          address: [null, [Validators.required]],
          zip: [null, [Validators.required]],
          city: [null, [Validators.required]],
          state: [null, [Validators.required]]
        };
      }
    } else {
      return {
        useBillingAddress: [true],
        address: [null, [Validators.required]],
        zip: [null, [Validators.required]],
        city: [null, [Validators.required]],
        state: [null, [Validators.required]]
      };
    }
  }

  private getOther() {
    if (this.business) {
      if (this.businessType === 'service') {
        return this.business.referrals
          ? {
            sponsorCode: [this.business.sponsorCode, []],
            referrals: [this.business.referrals, []]
          }
          : {
            sponsorCode: [this.business.sponsorCode, []],
            referrals: [
              [
                {
                  referName: null,
                  referEmail: null,
                  referPhone: null
                }
              ],
              []
            ]
          };
      } else if (this.businessType === 'resume') {
        return this.business.referrals
          ? {
            referrals: [this.business.referrals, []]
          }
          : {
            referrals: [
              [
                {
                  referName: null,
                  referEmail: null,
                  referPhone: null
                }
              ],
              []
            ]
          };
      } else {
        return this.business.referrals
          ? {
            businessTags: [
              this.business.businessTags || [],
              [Validators.required]
            ],
            sponsorCode: [this.business.sponsorCode, []],
            referrals: [this.business.referrals, []]
          }
          : {
            businessTags: [
              this.business.businessTags || [],
              [Validators.required]
            ],
            sponsorCode: [this.business.sponsorCode, []],
            referrals: [
              [
                {
                  referName: null,
                  referEmail: null,
                  referPhone: null
                }
              ],
              []
            ]
          };
      }
    } else {
      if (this.businessType === 'service') {
        return {
          sponsorCode: [null, []],
          referrals: [
            [
              {
                referName: null,
                referEmail: null,
                referPhone: null
              }
            ],
            []
          ]
        };
      } else if (this.businessType === 'resume') {
        return {
          referrals: [
            [
              {
                referName: null,
                referEmail: null,
                referPhone: null
              }
            ],
            []
          ]
        };
      } else {
        return {
          businessTags: [[], [Validators.required]],
          sponsorCode: [null, []],
          referrals: [
            [
              {
                referName: null,
                referEmail: null,
                referPhone: null
              }
            ],
            []
          ]
        };
      }
    }
  }

  private getAdministrators() {
    if (this.business) {
      return {
        adminEmail: [this.business.adminEmail, [Validators.required]],
        adminRole: [this.business.adminEmail, [Validators.required]]
      };
    } else {
      return {
        adminEmail: [[], [Validators.required]],
        adminRole: [null, [Validators.required]]
      };
    }
  }

  private getAnalytics() {
    if (this.business) {
      return {};
    } else {
      return {};
    }
  }

  private getEmployment() {
    if (this.business) {
      if (this.business.educationLevel < 3) {
        return {
          positions: [
            this.business.positions || [],
            [Validators.required]
          ],
          educationalInstitutions: [
            this.business.educationalInstitutions || []
          ],
          educationLevel: [
            this.business.educationLevel,
            [Validators.required]
          ],
          workType: [this.business.workType],
          workTypes: [this.business.workTypes, [Validators.required]],
          hasMilitaryService: [this.business.hasMilitaryService]
        };
      } else {
        return {
          positions: [
            this.business.positions || [],
            [Validators.required]
          ],
          educationalInstitutions: [
            this.business.educationalInstitutions || [],
            [Validators.required]
          ],
          educationLevel: [
            this.business.educationLevel,
            [Validators.required]
          ],
          workType: [this.business.workType],
          workTypes: [this.business.workTypes, [Validators.required]],
          hasMilitaryService: [this.business.hasMilitaryService]
        };
      }
    } else {
      return {
        positions: [[], [Validators.required]],
        educationalInstitutions: [[]],
        educationLevel: [
          {value: {id: EducationLevel.None, name: 'None'}},
          [Validators.required]
        ],
        workType: [1],
        workTypes: [[], [Validators.required]],
        hasMilitaryService: [false]
      };
    }
  }

  private getPreview() {
    return {
      referralEmail: [
        '',
        [Validators.pattern(AppSettings.EMAIL_PATTERN)]
      ],
      discountCode: '',
      complete: ['', [Validators.required]]
    };
  }

  private getPosition() {
    if (this.business) {
      return {
        positions: [
          this.business.positions || '',
          [
            Validators.required,
            Validators.maxLength(
              AppSettings.MAX_CHARS_POSITION_TITLE
            )
          ]
        ],
        workTypes: [
          this.business.workTypes || [],
          [Validators.required]
        ],
        compensationType: [
          this.business.compensationType > 0
            ? this.business.compensationType
            : null,
          [Validators.required]
        ],
        benefits: [this.business.benefits || []],
        compensationDescription: [
          this.business.compensationDescription || '',
          [Validators.required]
        ],
        positionRequirements: this.business.positionRequirements || '',
        minCompensationAmount: [
          this.business.minCompensationAmount || '',
          [Validators.required]
        ],
        maxCompensationAmount: [
          this.business.maxCompensationAmount || '',
          [Validators.required]
        ],
        isHideSalary: this.business.isHideSalary,
        jobAddress: [this.business.jobAddress, [Validators.required]],
        jobLatitude: [this.business.jobLatitude],
        jobLongitude: [this.business.jobLongitude],
        jobState: [this.business.jobState, [Validators.required]],
        jobCity: [this.business.jobCity, [Validators.required]],
        jobZip: [
          this.business.jobZip,
          [
            Validators.required,
            Validators.pattern(AppSettings.ZIPCODE_PATTERN)
          ]
        ],
        isRemote: this.business.isRemote,
        showRequirements: this.business.showRequirements,
        requireOtherApplicationMethod:
        this.business.requireOtherApplicationMethod,
        otherApplicationLink: [
          this.business?.otherApplicationLink || '',
          [Validators.pattern(AppSettings.WEBSITE_PATTERN)]
        ]
      };
    } else {
      return {
        positions: [[], [Validators.required]],
        workTypes: [[], [Validators.required]],
        compensationType: [[], [Validators.required]],
        benefits: [[]],
        compensationDescription: ['', [Validators.required]],
        positionRequirements: '',
        minCompensationAmount: [null, [Validators.required]],
        maxCompensationAmount: [null, [Validators.required]],
        isHideSalary: null,
        jobAddress: ['', [Validators.required]],
        jobState: ['', [Validators.required]],
        jobCity: ['', [Validators.required]],
        jobZip: [
          '',
          [
            Validators.required,
            Validators.pattern(AppSettings.ZIPCODE_PATTERN)
          ]
        ],
        isRemote: null,
        showRequirements: null,
        requireOtherApplicationMethod: false,
        otherApplicationLink: [
          '',
          [Validators.pattern(AppSettings.WEBSITE_PATTERN)]
        ]
      };
    }
  }

  getBusinessForm(step: Step = this.currentStep) {
    switch (step) {
      case Step.Information:
        return this.fb.group(this.getBusinessInformation());
      case Step.Images:
        return this.fb.group(this.getImages());
      case Step.Video:
        return this.fb.group(this.getPitchVideo());
      case Step.MoreInfo:
        return this.fb.group(this.getPricingHours());
      case Step.Radius:
        return this.fb.group(this.getAdvertisingRadius());
      case Step.Billing:
        return this.fb.group(this.getBilling());
      case Step.Employment:
        return this.fb.group(this.getEmployment());
      case Step.Preview:
        return this.fb.group(this.getPreview());
      case Step.Position:
        return this.fb.group(this.getPosition());
    }
  }

  getCurrentSection(stepNumber: number): Step {
    switch (this.businessType) {
      case PitchCardType.Service:
      case PitchCardType.Employee: {
        return this.getCurrentSectionService(stepNumber);
      }
      case PitchCardType.Resume: {
        return this.getCurrentSectionResume(stepNumber);
      }
      case PitchCardType.Job: {
        return this.getCurrentSectionJob(stepNumber);
      }
      default: {
        return this.getCurrentSectionDefault(stepNumber);
      }
    }
  }

  private getCurrentSectionService(stepNumber: number): Step {
    return this.setupStepsService()[stepNumber - 1].step;
  }

  private getCurrentSectionResume(stepNumber: number): Step {
    return this.setupStepsResume()[stepNumber - 1].step;
  }

  private getCurrentSectionJob(stepNumber: number): Step {
    return this.setupStepsJob()[stepNumber - 1].step;
  }

  private getCurrentSectionDefault(stepNumber: number): Step {
    return this.setupStepsDefault()[stepNumber - 1].step;
  }

  private setupStepperDefault(isAutofill?: boolean) {
    return [
      {
        label: 'Billing',
        value: Step.Billing,
        completed: isAutofill ? true : this.steps[0].completed,
        disabled: false,
        visited: isAutofill ? true : this.steps[0].visited,
        iconCompleted: 'pricing-outline',
        icon: 'pricing-outline-gray'
      },
      {
        label: 'Information',
        value: Step.Information,
        completed: isAutofill ? true : this.steps[1].completed,
        disabled: false,
        visited: isAutofill ? true : this.steps[1].visited,
        iconCompleted: 'phone-outline',
        icon: 'phone-outline-gray'
      },
      {
        label: 'More Info',
        value: Step.MoreInfo,
        completed: isAutofill ? false : this.steps[2].completed,
        disabled: false,
        visited: isAutofill ? false : this.steps[2].visited,
        iconCompleted: 'more-info-outline',
        icon: 'more-info-outline-gray'
      },
      {
        label: 'Radius',
        value: Step.Radius,
        completed: isAutofill ? true : this.steps[3].completed,
        disabled: false,
        visited: isAutofill ? true : this.steps[3].visited,
        iconCompleted: 'globe-outline',
        icon: 'globe-outline-gray'
      },
      {
        label: 'Images',
        value: Step.Images,
        completed: isAutofill ? false : this.steps[4].completed,
        disabled: false,
        visited: isAutofill ? false : this.steps[4].visited,
        iconCompleted: 'camera-outline',
        icon: 'camera-outline-gray'
      },
      {
        label: 'Pitch Video',
        value: Step.Video,
        completed: isAutofill ? true : this.steps[5].completed,
        disabled: false,
        visited: isAutofill ? true : this.steps[5].visited,
        iconCompleted: 'video-camera-outline',
        icon: 'video-camera-outline-gray'
      }
    ];
  }

  private setupStepperService(isAutofill?: boolean, type?: PitchCardType) {
    return [
      {
        label: 'Billing',
        value: Step.Billing,
        completed: isAutofill ? true : this.steps[0].completed,
        disabled: false,
        visited: isAutofill ? true : this.steps[0].visited,
        iconCompleted: 'pricing-outline',
        icon: 'pricing-outline-gray'
      },
      {
        label: 'Information',
        value: Step.Information,
        completed: isAutofill
          ? type !== PitchCardType.Service
          : this.steps[1].completed,
        disabled: false,
        visited: isAutofill
          ? type !== PitchCardType.Service
          : this.steps[1].visited,
        iconCompleted: 'phone-outline',
        icon: 'phone-outline-gray'
      },
      {
        label: 'More Info',
        value: Step.MoreInfo,
        completed: isAutofill ? false : this.steps[2].completed,
        disabled: false,
        visited: isAutofill ? false : this.steps[2].visited,
        iconCompleted: 'more-info-outline',
        icon: 'more-info-outline-gray'
      },
      {
        label: 'Images',
        value: Step.Images,
        completed: isAutofill ? false : this.steps[3].completed,
        disabled: false,
        visited: isAutofill ? false : this.steps[3].visited,
        iconCompleted: 'camera-outline',
        icon: 'camera-outline-gray'
      },
      {
        label: 'Pitch Video',
        value: Step.Video,
        completed: isAutofill ? true : this.steps[4].completed,
        disabled: false,
        visited: isAutofill ? true : this.steps[4].visited,
        iconCompleted: 'video-camera-outline',
        icon: 'video-camera-outline-gray'
      }
    ];
  }

  private setupStepperResume() {
    return [
      {
        label: 'Information',
        value: Step.Information,
        completed: this.steps[0].completed,
        disabled: false,
        visited: this.steps[0].visited,
        iconCompleted: 'phone-outline',
        icon: 'phone-outline-gray'
      },
      {
        label: 'More Info',
        value: Step.MoreInfo,
        completed: this.steps[1].completed,
        disabled: false,
        visited: this.steps[1].visited,
        iconCompleted: 'more-info-outline',
        icon: 'more-info-outline-gray'
      },
      {
        label: 'Radius',
        value: Step.Radius,
        completed: this.steps[2].completed,
        disabled: false,
        visited: this.steps[2].visited,
        iconCompleted: 'globe-outline',
        icon: 'globe-outline-gray'
      },
      {
        label: 'Employment',
        value: Step.Employment,
        completed: this.steps[3].completed,
        disabled: false,
        visited: this.steps[3].visited,
        iconCompleted: 'business-outline',
        icon: 'business-outline-gray'
      },
      {
        label: 'Files',
        value: Step.Images,
        completed: this.steps[4].completed,
        disabled: false,
        visited: this.steps[4].visited,
        iconCompleted: 'files-outline',
        icon: 'files-outline-gray'
      },
      {
        label: 'Pitch Video',
        value: Step.Video,
        completed: this.steps[5].completed,
        disabled: false,
        visited: this.steps[5].visited,
        iconCompleted: 'video-camera-outline',
        icon: 'video-camera-outline-gray'
      }
    ];
  }

  setupStepperJob(isAutofill?: boolean) {
    return [
      {
        label: 'Information',
        value: Step.Information,
        completed: isAutofill ? true : this.steps[0].completed,
        disabled: false,
        visited: isAutofill ? true : this.steps[0].visited,
        iconCompleted: 'phone-outline',
        icon: 'phone-outline-gray'
      },
      {
        label: 'More Info',
        value: Step.MoreInfo,
        completed: isAutofill ? true : this.steps[1].completed,
        disabled: false,
        visited: isAutofill ? true : this.steps[1].visited,
        iconCompleted: 'more-info-outline',
        icon: 'more-info-outline-gray'
      },
      {
        label: 'Images',
        value: Step.Images,
        completed: isAutofill ? false : this.steps[2].completed,
        disabled: false,
        visited: isAutofill ? false : this.steps[2].visited,
        iconCompleted: 'files-outline',
        icon: 'files-outline-gray'
      },
      {
        label: 'Pitch Video',
        value: Step.Video,
        completed: isAutofill ? true : this.steps[3].completed,
        disabled: false,
        visited: isAutofill ? true : this.steps[3].visited,
        iconCompleted: 'video-camera-outline',
        icon: 'video-camera-outline-gray'
      },
      {
        label: 'Position',
        value: Step.Position,
        completed: isAutofill ? false : this.steps[4].completed,
        disabled: false,
        visited: isAutofill ? false : this.steps[4].visited,
        iconCompleted: 'position-outline',
        icon: 'position-outline-gray'
      }
    ];
  }

  setupStepper(isAutofill: boolean = false, type?) {
    let stepper = [];
    switch (!isAutofill ? this.businessType : type) {
      case PitchCardType.Resume: {
        stepper = this.setupStepperResume();
        break;
      }
      case PitchCardType.Job: {
        stepper = this.setupStepperJob(isAutofill);
        break;
      }
      case PitchCardType.Service:
      case PitchCardType.Employee: {
        stepper = this.setupStepperService(
          isAutofill,
          type ? type : null
        );
        break;
      }
      default: {
        stepper = this.setupStepperDefault(isAutofill);
        break;
      }
    }

    if (this.business && this.business.role !== FolderContentRole.Owner) {
      const billingStep = stepper.find((x) => x.value == Step.Billing);
      if (billingStep) {
        billingStep.disabled = true;
      }

      if (this.currentStep == Step.Billing) {
        this.currentStep = Step.Information;
      }
    }

    return stepper;
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  getAddressComponent(address_components: any[], type: string) {
    const value = address_components.find((x) => x.types.includes(type));
    if (value) {
      return type === 'administrative_area_level_1'
        ? value.short_name
        : value.long_name;
    } else {
      return null;
    }
  }

  getIntroOptions() {
    if (this.business) {
      return [
        {
          extraPhoneNumber: this.business?.extraPhoneNumber
            ? this.business.extraPhoneNumber
            : this.business?.contactNumber
              ? this.business.contactNumber
              : '',
          introText: this.business?.introText
            ? this.business.introText
            : '',
          textValue: '',
          isEnabledIntroText: this.business?.isEnabledIntroText
        },
        this.business?.isEnabledIntroText ? [Validators.required] : null
      ];
    } else {
      return [
        {
          extraPhoneNumber: '',
          introText: this.business?.introText
            ? this.business.introText
            : '',
          textValue: '',
          isEnabledIntroText: true
        },
        [Validators.required]
      ];
    }
  }

  encodeExistIntroText(details: {
    companyName: string;
    name?: string;
    template?: string;
  }) {
    const {companyName, name} = details;
    let {template} = details;
    const variables: string[] = [
      '<strong>Name</strong>',
      '<strong>Company Name</strong>',
      '<strong>Organization Name</strong>'
    ];
    if (template?.includes(variables[0]) && name) {
      template = template.replace(
        variables[0],
        `<strong>${name}</strong>`
      );
    }
    if (template?.includes(variables[0]) && companyName && !name) {
      template = template.replace(
        variables[0],
        `<strong>${companyName}</strong>`
      );
    }
    if (template?.includes(variables[1]) && companyName) {
      template = template.replace(
        variables[1],
        `<strong>${companyName}</strong>`
      );
    }
    if (template?.includes(variables[2]) && companyName) {
      template = template.replace(
        variables[2],
        `<strong>${companyName}</strong>`
      );
    }
    return template;
  }

  encodeCustomIntroText() {
    let {introText} = this.draftBusiness;
    const {businessName, title} = this.draftBusiness;
    const nameVar = '<strong>Name</strong>';
    const companyNameVar =
      this.businessType === PitchCardType.Service
        ? '<strong>Organization Name</strong>'
        : '<strong>Company Name</strong>';
    if (introText.includes(title)) {
      introText = introText.replace(`<strong>${title}</strong>`, nameVar);
    }
    if (introText.includes(businessName)) {
      introText = introText.replace(
        `<strong>${businessName}</strong>`,
        companyNameVar
      );
    }
    return introText;
  }

  extractHtmlContent(htmlText: string): string {
    const span = document.createElement('span');
    span.innerHTML = htmlText;
    return span.textContent || span.innerText;
  }
}
