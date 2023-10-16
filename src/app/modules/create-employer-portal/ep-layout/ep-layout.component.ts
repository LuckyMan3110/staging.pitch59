import {
  AfterContentChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { BusinessDetails } from '../../business/models/business-detail.model';
import {
  CheckoutItem,
  Step
} from '../../create-pitch-card/create-pitch-card.service';
import { environment } from '../../../../environments/environment';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { PitchCardModalsWrapperService } from '../../pitch-card-shared/services/pitchcard-modals-wrapper.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { StorageService } from '../../shared/services/storage.service';
import { UserCommonService } from '../../shared/services/user-common.service';
import { CommonBindingDataService } from '../../shared/services/common-binding-data.service';
import { BusinessService } from '../../business/services/business.service';
import { FileSaverService } from 'ngx-filesaver';
import { LoaderState } from '../../shared/components/loader/loader';
import { UniqueComponentId } from 'primeng/utils';
import { AppSettings } from '../../shared/app.settings';
import { CreateEmployerPortalService } from '../create-employer-portal.service';
import { OrganizationModel } from '../../choosen-history/pages/employer-portal/models/organization-model';
import { StepperItem } from '../../creation-tiles-shared/components/stepper/stepper.component';
import { UiService } from '../../shared/services/ui.service';
import { PixelService } from 'ngx-pixel';
import { NavigationService } from '../../shared/services/navigation.service';

@Component({
  selector: 'app-ep-layout',
  templateUrl: './ep-layout.component.html',
  styleUrls: ['./ep-layout.component.scss']
})
export class EpLayoutComponent
  implements OnInit, AfterViewInit, AfterContentChecked, OnDestroy {
  @Input() externalProduct: OrganizationModel;
  @Output() closeLayout: EventEmitter<boolean> = new EventEmitter<boolean>();
  ID: string | number;

  $businessUpdate: Subscription;
  $checkout: Subscription;
  $draftBusiness: Subscription;
  $navigate: Subscription;
  $stepsUpdate: Subscription;
  $approvePaymentModal: Subscription;

  allStepsCompleted: boolean;
  appLoader: boolean = false;
  business: BusinessDetails;
  businessName: string;
  businessType: string;
  checkout: CheckoutItem[] = [];
  completedStepsNumber: number = 0;
  congratStep: boolean = false;
  displayHeader = true;
  displaySidebar: boolean = false;
  displayPitchCardView: boolean = false;
  items: StepperItem[] = [];
  steps = Step;
  loaded = false;
  mobileMode: boolean = false;
  modalTop = 52;
  scaleFactor = 1.0;
  stepsColumnsInTheRow = 3;
  steplabel: string;
  subscription = new Subscription();

  uniqueId: string;

  paymentApprovedModal: boolean = false;
  showCongratulationsWindow: boolean = false;

  requestStatus: any;

  baseUrl = environment.appBaseUrl;

  @HostBinding('style.--scale-factor') get scale() {
    return this.scaleFactor;
  }

  @ViewChild('pitchCardWrapper', {static: false})
  pitchCardWrapper: ElementRef;
  @ViewChild('progressWrapper', {static: true}) progressWrapper: ElementRef;

  constructor(
    private pixel: PixelService,
    private loaderService: LoaderService,
    private pitchCardModalsWrapperService: PitchCardModalsWrapperService,
    private router: Router,
    private route: ActivatedRoute,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    public service: CreateEmployerPortalService,
    private userCommonService: UserCommonService,
    private commonBindingService: CommonBindingDataService,
    private businessService: BusinessService,
    private fileSaverService: FileSaverService,
    private uiService: UiService
  ) {
    this.pixel.track('PageView', {
      content_name: 'Employer Portal'
    });
    this.onResized = this.onResized.bind(this);
    this.modalTop = this.calcContainerMargin();
    this.mobileMode = window.matchMedia('(max-width: 767px)').matches;

    window.addEventListener('resize', this.onResized);

    // if (this.router.url.includes('create')) {
    //   router.events.subscribe((event: NavigationStart) => {
    //     if (event.navigationTrigger === 'popstate' && (this.service.businessType === 'resume' ? this.service.currentStep !== Step.Information : this.service.currentStep !== Step.Billing)) {
    //       if (this.service.currentStep === Step.Images && this.service.displayCustom) {
    //         router.navigateByUrl('cancel-navigation');
    //         this.service.closeGalleria();
    //       } else {
    //         this.PrevSection();
    //       }
    //     } else if (event.navigationTrigger === 'popstate' && router.isActive(this.service.businessType === 'resume' ? '/create/information' : 'create/billing', true)) {
    //       router.navigate(['account/my-pitchcards']);
    //     }
    //   });
    // }
  }

  ngOnInit(): void {
    this.uniqueId = UniqueComponentId();

    if (
      this.storageService.getItem(AppSettings.DRAFT_PRODUCT_ID) &&
      !this.router.parseUrl(this.router.url).queryParams.organizationId
    ) {
      const queryParams: Params = {
        organizationId: this.storageService.getItem(
          AppSettings.DRAFT_PRODUCT_ID
        )
      };
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: queryParams,
        queryParamsHandling: 'merge'
      });
    }
    if (this.router.parseUrl(this.router.url).queryParams.organizationId) {
      this.ID = this.router.parseUrl(
        this.router.url
      ).queryParams.organizationId;
      this.storageService.setItem(
        AppSettings.DRAFT_PRODUCT_ID,
        this.router.parseUrl(this.router.url).queryParams.organizationId
      );
      this.removeBusinessFromLS();
      this.clearQueryParams();
    }

    this.service.business = new OrganizationModel(this.externalProduct);
    this.service.initBusiness();

    if (this.storageService.getItem('Billing')) {
      this.service.currentStep = Step.Billing;
      this.storageService.removeItem('Billing');
    } else {
      this.service.currentStep = Step.Information;
    }

    this.initSubscriptions();
  }

  ngOnDestroy(): void {
    if (this.$stepsUpdate) {
      this.$stepsUpdate.unsubscribe();
    }

    if (this.$businessUpdate) {
      this.$businessUpdate.unsubscribe();
    }

    if (this.$checkout) {
      this.$businessUpdate.unsubscribe();
    }

    if (this.$navigate) {
      this.$navigate.unsubscribe();
    }

    if (this.$draftBusiness) {
      this.$draftBusiness.unsubscribe();
    }

    if (this.$approvePaymentModal) {
      this.$approvePaymentModal.unsubscribe();
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.storageService.removeItem('BILLING_FREQUENCY');
    this.storageService.removeItem(AppSettings.HAS_VIRTUAL_VIDEO);
    this.service.paymentFrequency = null;

    window.removeEventListener('resize', this.onResized);
    this.clearQueryParams();
  }

  initSubscriptions() {
    this.subscription = this.loaderService.loaderState.subscribe(
      (state: LoaderState) => {
        this.appLoader = state.show;
      }
    );

    this.$businessUpdate = this.service.$businessUpdated.subscribe(() => {
      this.business = this.service.business as OrganizationModel;
      this.businessType = this.business.businessType;
      this.setupStepper();
      this.loaded = true;
      const tempId = this.storageService.getSession(
        AppSettings.DRAFT_BUSINESS_ID
      );
      if (!tempId || tempId !== `"${this.business.id}"`) {
        this.service.currentStep =
          this.service.businessType === 'resume' ? 1 : 6;
      }
    });

    this.$stepsUpdate = this.service.$stepsUpdate.subscribe(() => {
      this.setupStepper();
    });

    this.$draftBusiness = this.service.$draftBusinessUpdated.subscribe(
      (value) => {
        this.business = Object.assign(OrganizationModel, value);
      }
    );

    this.$approvePaymentModal = this.service.$paymentApproveModal.subscribe(
      (r) => {
        if (r) {
          this.handlePaymentApproveModal();
        }
      }
    );
  }

  handlePaymentApproveModal() {
    this.requestStatus = JSON.parse(
      this.storageService.getItem(AppSettings.PAYMENT_REQUEST)
    );
    if (this.requestStatus) {
      this.paymentApprovedModal = true;
      this.storageService.removeItem(AppSettings.PAYMENT_REQUEST);
    }
  }

  removeBusinessFromLS() {
    if (this.storageService.getSession(AppSettings.DRAFT_BUSINESS_ID)) {
      this.storageService.removeSession(AppSettings.DRAFT_BUSINESS_ID);
    }
    if (this.storageService.getSession(AppSettings.DRAFT_PITCH_CARD_TYPE)) {
      this.storageService.removeSession(
        AppSettings.DRAFT_PITCH_CARD_TYPE
      );
    }
  }

  clearQueryParams() {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  calcContainerMargin() {
    if (document.body.clientWidth >= 470) {
      return 60;
    }

    if (document.body.clientWidth >= 768) {
      return 72;
    }

    return 52;
  }

  setupStepper() {
    this.items = this.service.setupStepper();
    if (this.service.CurrentStepIndex !== -1) {
      this.steplabel = this.items[this.service.CurrentStepIndex].label;
    } else {
      this.service.currentStep =
        this.service.businessType === 'resume'
          ? Step.Information
          : Step.Billing;
      this.steplabel = this.items[0].label;
    }

    this.allStepsCompleted = this.items.filter((x) => x.completed).length === this.items.length;
    this.completedStepsNumber = this.items.filter((item) => item.completed).length;

    if (this.items.length){
      let previousCompleted = true;
      let previousVisited = true;
      this.items.map ((item, key) => {
        if (item.label == "More Info"){
          if (!previousCompleted && !item.visited) {
            this.items[key].completed = false;
          }
          if (this.allStepsCompleted && this.items[key].completed){
            this.items[key].visited = true;
            this.items[key].completed = true;
          }
        }
        else if (item.label == "Pitch Video"){
          if (!previousCompleted && !previousVisited) {
            this.items[key].completed = false;
            return;
          }
        }
        previousCompleted = previousCompleted && item.completed;
        previousVisited = previousVisited && item.visited;
      });
    }
  }

  PrevSection() {
    this.service.moveToStep = this.service.getPrevSection();
    this.service.$validateSection.next(this.service.currentStep);
  }

  NextSection() {
    if (this.service.tileRequiredState) {
      this.service.moveToStep = this.service.getNextSection();
    } else {
      this.service.moveToStep = this.service.getCurrentStep();
      if (this.service.tileFormGroup.controls) {
        Object.keys(this.service.tileFormGroup.controls).forEach(
          (key: string) => {
            this.service.tileFormGroup.controls[key].markAsDirty();
          }
        );
      }
    }
    this.service.$validateSection.next(this.service.currentStep);
  }

  goToSection(value: Step) {
    this.displaySidebar = false;
    this.service.moveToStep = value;
    this.service.$validateSection.next(this.service.currentStep);
  }

  togglePitchCardView() {
    this.displayPitchCardView = !this.displayPitchCardView;
  }

  toggleProgressMenu() {
    this.displaySidebar = !this.displaySidebar;
  }

  onResized() {
    this.modalTop = this.calcContainerMargin();
    this.mobileMode = window.matchMedia('(max-width: 767px)').matches;

    let resizedFlag = false;
    const corrector =
      window.innerWidth > 1024 && window.innerHeight > 1024 ? 0 : 0.06;

    if (this.pitchCardWrapper) {
      const parentOffset =
        this.pitchCardWrapper.nativeElement.parentElement.offsetLeft +
        this.pitchCardWrapper.nativeElement.parentElement.clientWidth;
      const childOffset =
        this.pitchCardWrapper.nativeElement.offsetLeft +
        this.pitchCardWrapper.nativeElement.clientWidth;

      if (parentOffset - 120 < childOffset) {
        this.scaleFactor = (parentOffset - 120) / childOffset;
        this.scaleFactor -= corrector;
        resizedFlag = true;
      }
      if (
        this.pitchCardWrapper.nativeElement.previousSibling
          .clientHeight -
        45 <
        this.pitchCardWrapper.nativeElement.clientHeight
      ) {
        const heightScaleFactor =
          (this.pitchCardWrapper.nativeElement.previousSibling
              .clientHeight -
            45) /
          this.pitchCardWrapper.nativeElement.clientHeight;

        if (heightScaleFactor < this.scaleFactor) {
          this.scaleFactor = heightScaleFactor;
        }

        this.scaleFactor -= corrector;
        resizedFlag = true;
      }
      if (!resizedFlag) {
        this.scaleFactor = 1 - corrector;
      }
      resizedFlag = false;
    }
  }

  ngAfterViewInit(): void {
    this.onResized();
    setTimeout(() => {
      if (this.pitchCardWrapper) {
        this.pitchCardWrapper.nativeElement.style.visibility =
          'visible';
      }
    }, 1000);
  }

  ngAfterContentChecked() {
    if (this.pitchCardWrapper) {
      this.onResized();
    }
  }

  finishAndSubmit() {
    this.service.$validateSection.next(this.service.currentStep);
    if (this.allStepsCompleted) {
      this.service.saveChanges(true, false).subscribe(
        (x) => {
          this.userCommonService.createOrEditSubject.next('Create A');
          this.closeLayout.emit(true);
        },
        (error) => {
          this.uiService.errorMessage(error.Message);
          this.closeLayout.emit(true);
        }
      );
    }
  }

  saveAndExit() {
    this.service.$validateSection.next(this.service.currentStep);
    this.service.saveChanges(true).subscribe(
      (x) => {
        this.service.clearPitchCardType();
        this.service.currentStep =
          this.service.businessType === 'resume' ? 1 : 6;
        this.service.clearDraftBusiness();
        this.router.navigate(['/account/employer-portal']);
        this.congratStep = false;
      },
      (error) => {
        if (error.Code === 9053) {
          this.service.errorMessageForCardDeclied = error.Message;
        }
      }
    );
  }

  backFromCongrats() {
    this.service.currentStep = this.service.lastSectionIndex;
    this.congratStep = false;
  }

  handlePitchCardTitleClick(event: any) {
    const {title, businessDetails} = event;

    this.pitchCardModalsWrapperService.setUniqueId(this.uniqueId);
    this.pitchCardModalsWrapperService.setCurrentBusiness(businessDetails);
    this.pitchCardModalsWrapperService.onTitleClick(title);
  }

  getBusinessTypeValue(type: string) {
    switch (type) {
      case 'employee':
        return 'Business Employee';
      case 'basic':
        return 'Business Basic';
      case 'premium':
        return 'Business Premium';
      case 'service':
        return 'Nonprofit';
      default:
        return type;
    }
  }

  SaveAndClear() {
    this.service.moveToStep = this.service.currentStep =
      this.service.businessType === 'resume'
        ? Step.Information
        : Step.Billing;
    this.service.clearBusiness();
  }

  onViewPitchCard() {
    this.togglePitchCardView();
  }

  handlePitchCardStatus() {
    this.business.accountStatus = !this.business.accountStatus;

    this.businessService
      .activateDeactiveAccountStatus(
        this.business.id,
        this.business.accountStatus
      )
      .subscribe((result) => {
        console.log(result);
      });
  }
}
