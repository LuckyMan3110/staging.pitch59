import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationStart,
  Params,
  Router
} from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';

import { CreatePitchCardService, Step } from '../create-pitch-card.service';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { PitchCardModalsWrapperService } from '../../pitch-card-shared/services/pitchcard-modals-wrapper.service';

import { LoaderState } from '../../shared/components/loader/loader';

import { BusinessDetails } from '../../business/models/business-detail.model';
import { StorageService } from '../../shared/services/storage.service';
import { AppSettings } from '../../shared/app.settings';
import { UniqueComponentId } from 'primeng/utils';
import { UserCommonService } from '../../shared/services/user-common.service';
import { CommonBindingDataService } from '../../shared/services/common-binding-data.service';
import { BusinessService } from '../../business/services/business.service';
import { environment } from '../../../../environments/environment';
import { FileSaverService } from 'ngx-filesaver';
import { StepperItem } from '../../creation-tiles-shared/components/stepper/stepper.component';
import { PitchCardType } from '../../shared/enums/pitch-card-type.enum';
import { first } from 'rxjs/operators';
import { SearchResultThumbnailComponent } from '../../pitch-card-shared/components/search-result-thumbnail/search-result-thumbnail.component';
import { UiService } from '../../shared/services/ui.service';
import { FolderContentRole } from '../../choosen-history/enums/folder-content-role.enum';
import { EmployerPortalService } from '../../choosen-history/services/employer-portal.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  $businessUpdate: Subscription;
  $finish: Subscription;
  $draftBusiness: Subscription;
  $navigate: Subscription;
  $stepsUpdate: Subscription;
  $approvePaymentModal: Subscription;
  $layoutSubscription: Subscription = new Subscription();
  $stepsAvailable: Subject<boolean> = new Subject<boolean>();
  form: FormGroup;

  allStepsCompleted: boolean;
  appLoader: boolean = false;
  business: BusinessDetails;
  businessName: string;
  businessType: string;
  completedStepsNumber: number = 0;
  defaultCompletedStepsNumber: number = 0;
  congratStep: boolean = false;
  displayHeader = true;
  displaySidebar: boolean = false;
  displayPitchCardView: boolean = false;
  showAutofillModal: boolean = false;
  items: StepperItem[] = [];
  autofillItems: StepperItem[] = [];
  loaded = false;
  mobileMode: boolean = false;
  isMobile = this.dds.isMobile();
  modalTop = 52;
  scaleFactor = 1.0;
  stepsColumnsInTheRow = 3;
  steplabel: string;
  subscription = new Subscription();

  uniqueId: string;

  paymentApprovedModal: boolean = false;
  showCongratulationsWindow: boolean = false;
  showCongratulationsJobCard: boolean = false;

  requestStatus: any;

  baseUrl = environment.appBaseUrl;
  activeTabFromStorage: number;

  @ViewChild('previewCard') previewCard: SearchResultThumbnailComponent;

  @HostBinding('style.--scale-factor') get scale() {
    return this.scaleFactor;
  }

  @HostListener('window:click', ['$event'])
  handleClick(event: any) {
    const classes = event.target?.classList;
    const parentNodes = this.commonBindingService.getParentNodes(
      classes,
      'contact-menu-container'
    );

    if (
      !parentNodes?.length &&
      !event.target.classList.contains('contact-menu-button') &&
      this.previewCard
    ) {
      this.previewCard.toggleContactMenu(null);
    }
  }

  @ViewChild('pitchCardWrapper', {static: false})
  pitchCardWrapper: ElementRef;
  @ViewChild('progressWrapper', {static: true}) progressWrapper: ElementRef;

  constructor(
    private loaderService: LoaderService,
    private pitchCardModalsWrapperService: PitchCardModalsWrapperService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    public service: CreatePitchCardService,
    private userCommonService: UserCommonService,
    private commonBindingService: CommonBindingDataService,
    private businessService: BusinessService,
    private teamService: EmployerPortalService,
    private fileSaverService: FileSaverService,
    private uiService: UiService,
    private dds: DeviceDetectorService
  ) {
    this.onResized = this.onResized.bind(this);
    this.modalTop = this.calcContainerMargin();
    this.mobileMode = window.matchMedia('(max-width: 767px)').matches;

    window.addEventListener('resize', this.onResized);

    this.subscription = this.loaderService.loaderState.subscribe(
      (state: LoaderState) => {
        this.appLoader = state.show;
      }
    );

    if (this.router.url.includes('create')) {
      router.events.subscribe((event: NavigationStart) => {
        if (
          event.navigationTrigger === 'popstate' &&
          (this.service.businessType === PitchCardType.Resume
            ? this.service.currentStep !== Step.Information
            : this.service.currentStep !== Step.Billing)
        ) {
          if (
            this.service.currentStep === Step.Images &&
            this.service.displayCustom
          ) {
            router.navigateByUrl('cancel-navigation');
            this.service.closeGalleria();
          } else {
            if (this.service.businessType === PitchCardType.Job) {
              this.goBackToEmployerPortal();
            } else {
              this.PrevSection();
            }
          }
        } else if (
          event.navigationTrigger === 'popstate' &&
          router.isActive(
            this.service.businessType === PitchCardType.Resume
              ? '/create/information'
              : 'create/billing',
            true
          )
        ) {
          router.navigate(
            this.service.businessType === PitchCardType.Job ||
            this.service?.business?.organizationId
              ? ['/account/employer-portal']
              : ['/account/my-pitchcards']
          );
        }
      });
    }
  }

  ngOnInit(): void {
    this.uniqueId = UniqueComponentId();

    this.handlePaymentApproveModal();
    if (
      this.storageService.getSession(AppSettings.DRAFT_BUSINESS_ID) &&
      !this.router.parseUrl(this.router.url).queryParams.businessId
    ) {
      const queryParams: Params = {
        businessId: this.storageService.getSession(
          AppSettings.DRAFT_BUSINESS_ID
        )
      };
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: queryParams,
        queryParamsHandling: 'merge'
      });
    } else if (
      this.router.parseUrl(this.router.url).queryParams.businessId
    ) {
      this.storageService.setSession(
        AppSettings.DRAFT_BUSINESS_ID,
        this.router.parseUrl(this.router.url).queryParams.businessId
      );
    }
    const teamToken = this.router.parseUrl(this.router.url).queryParams
      .teamToken;

    if (teamToken) {
      this.teamService.joinTeamByInvite(teamToken).subscribe(
        (r) => {
          if (r.data.businessId) {
            this.storageService.setSession(
              AppSettings.DRAFT_BUSINESS_ID,
              r.data.businessId
            );
            this.service.initBusiness();
          }
        },
        (err) => {
          this.uiService.errorMessage(err.Message);
          setTimeout(() => {
            this.router.navigate(['/account/my-pitchcards']);
          }, 2500);
        }
      );
    } else {
      this.service.initBusiness();
    }

    this.activeTabFromStorage = this.storageService.getItem(
      AppSettings.OPEN_ACTIVE_TILE,
      true
    );

    this.initSubscriptions();
  }

  ngOnDestroy(): void {
    if (this.$stepsUpdate) {
      this.$stepsUpdate.unsubscribe();
    }

    if (this.$businessUpdate) {
      this.$businessUpdate.unsubscribe();
    }

    if (this.$finish) {
      this.$finish.unsubscribe();
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

    if (this.$layoutSubscription) {
      this.$layoutSubscription.unsubscribe();
    }

    if (this.$stepsAvailable) {
      this.$stepsAvailable.unsubscribe();
    }
    this.storageService.removeItem('BILLING_FREQUENCY');
    this.storageService.removeItem(AppSettings.HAS_VIRTUAL_VIDEO);
    this.storageService.removeSession(AppSettings.ALIAS_LINK);
    this.storageService.removeSession(AppSettings.OPEN_AUTOFILL_MODAL);
    this.service.paymentFrequency = null;

    window.removeEventListener('resize', this.onResized);
  }

  initSubscriptions() {
    this.$businessUpdate = this.service.$businessUpdated.subscribe(() => {
      this.business = this.service.business;
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
      if (this.router.parseUrl(this.router.url).queryParams.businessId) {
        const pathSegments = this.router.parseUrl(this.router.url).root
          .children.primary.segments;
        if (pathSegments.length > 1) {
          this.router.navigate([
            `/create/${pathSegments[pathSegments.length - 1].path}`
          ]);
        } else {
          if (this.service.currentStep) {
            this.router.navigate([this.service.getSectionRoute()]);
          } else {
            return;
          }
        }
      } else {
        this.router.navigate([this.service.getSectionRoute()]);
      }
      this.setupStepper();
    });

    this.$draftBusiness = this.service.$draftBusinessUpdated.subscribe(
      (value) => {
        this.business = Object.assign({}, value);
      }
    );

    this.$approvePaymentModal = this.service.$paymentApproveModal.subscribe(
      (r) => {
        if (r) {
          this.handlePaymentApproveModal();
        }
      }
    );

    this.$layoutSubscription.add(
      this.$stepsAvailable.pipe(first()).subscribe((res) => {
        if (res) {
          this.setJobCardActiveStep();
        }
      })
    );
    this.$layoutSubscription.add(
      this.service.$autofillModalSubject.subscribe((res) => {
        const {role, organizationId, progress} =
          this.service?.business;
        const isDisableAutofill = this.storageService.getSession(
          AppSettings.OPEN_AUTOFILL_MODAL
        );
        if (
          (res &&
            role === FolderContentRole.TeamMember &&
            !progress) ||
          (role === FolderContentRole.Owner &&
            !progress &&
            organizationId &&
            !isDisableAutofill)
        ) {
          this.calculateBusinessProgress();
        }
      })
    );
  }

  calculateBusinessProgress() {
    const {businessId, organizationId, businessType} =
      this.service.business;
    if (businessId && organizationId) {
      this.$layoutSubscription.add(
        this.businessService
          .calculateBusinessProgress(businessId, organizationId)
          .subscribe(
            (r) => {
              if (r?.data) {
                this.autofillItems = this.service.setupStepper(
                  true,
                  businessType
                );
                const {filledSteps, calculatedSteps} =
                  this.businessService.calculateProgressBySteps(
                    r.data,
                    this.autofillItems
                  );
                if (filledSteps && calculatedSteps?.length) {
                  this.defaultCompletedStepsNumber =
                    filledSteps;
                  this.autofillItems = calculatedSteps;
                } else {
                  if (!this.defaultCompletedStepsNumber) {
                    this.defaultCompletedStepsNumber =
                      this.autofillItems.filter(
                        (item) => item.completed
                      ).length;
                  }
                }
                this.showAutofillModal = true;
                this.storageService.removeSession(
                  AppSettings.OPEN_AUTOFILL_MODAL
                );
              }
            },
            (e) => {
              this.uiService.errorMessage(
                e?.message
                  ? e.message
                  : 'Get business progress has been failed'
              );
            }
          )
      );
    } else {
      if (!organizationId) {
        this.uiService.warningMessage(
          'Current business doesn\'t belong to any of the organizations'
        );
      }
      if (!businessId) {
        this.uiService.errorMessage(
          'Get business progress has been failed'
        );
      }
    }
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
    if (this.service.businessType) {
      this.items = this.service.setupStepper();
    }
    if (this.service.CurrentStepIndex !== -1) {
      this.steplabel = this.items[this.service.CurrentStepIndex].label;
    } else {
      this.service.currentStep =
        this.service.businessType === 'resume'
          ? Step.Information
          : this.setJobCardActiveStep();
      this.steplabel = this.items[0].label;
    }

    this.allStepsCompleted = this.items.filter((x) => x.completed).length === this.items.length;
    this.completedStepsNumber = this.items.filter((item) => item.completed).length;
    this.service.isAllCompleted = this.completedStepsNumber == this.items.length? true : false;

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

  setJobCardActiveStep() {
    if (this.service.businessType === PitchCardType.Job) {
      if (this.activeTabFromStorage?.toString()) {
        this.service.currentStep = this.activeTabFromStorage;
        this.storageService.removeItem(AppSettings.OPEN_ACTIVE_TILE);
      } else if (
        this.items.filter((x) => x.completed).length ===
        this.items.length - 1 &&
        !this.items[this.items?.length - 1].completed
      ) {
        return Step.Position;
      } else {
        return Step.Information;
      }
    } else {
      return Step.Billing;
    }
  }

  PrevSection() {
    const isOrganizationBusiness = !!this.business?.organizationId;
    const isOwner = this.business.role === FolderContentRole.Owner;
    const isResume = this.businessType === PitchCardType.Resume;
    const hasProgress = !!this.business.businessId;
    if (
      this.service.getPrevSection() === this.service.moveToStep ||
      (this.service.getPrevSection() === Step.Billing &&
        this.items.find(
          (i: any) => i.value === Step.Billing && i.disabled
        ))
    ) {
      if (isOwner) {
        this.router.navigate(
          isOrganizationBusiness
            ? ['/account/employer-portal']
            : ['/account/my-pitchcards']
        );
      } else if (isResume && !hasProgress) {
        this.router.navigate(['/select-pitchcards']);
      } else {
        this.router.navigate(['/account/my-pitchcards']);
      }
    } else {
      this.service.moveToStep = this.service.getPrevSection();
      this.service.$validateSection.next(this.service.currentStep);
    }
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

  goBackToEmployerPortal() {
    this.router.navigate(['/account/employer-portal']);
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
    if (this.allStepsCompleted) {
      this.service.finished = true;
      this.$layoutSubscription.add(
        this.service.$finish.subscribe((x) => {
          this.service.saveChanges().subscribe(() => {
            this.service.finished = false;
            this.userCommonService.createOrEditSubject.next(
              'Create A'
            );
            this.congratStep = true;

            if (this.service.businessType !== PitchCardType.Job) {
              this.showCongratulationsWindow = true;
            } else {
              this.showCongratulationsJobCard = true;
            }
          });
        })
      );
    }
    this.service.$validateSection.next(this.service.currentStep);
  }

  saveAndExit() {
    const shareLink = this.storageService.getSession(
      AppSettings.ALIAS_LINK
    );
    this.service.clearPitchCardType();
    this.service.currentStep =
      this.service.businessType === 'resume' ? 1 : 6;
    this.service.clearDraftBusiness();
    this.router.navigate(
      this.service?.business?.organizationId ||
      this.service?.business?.organizationName
        ? ['/account/employer-portal']
        : this.businessType === PitchCardType.Resume && shareLink
          ? [shareLink]
          : ['/account/my-pitchcards']
    );
    this.congratStep = false;
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
        return 'Individual';
      case 'basic':
        return 'Company';
      case 'service':
        return 'Nonprofit';
      case 'job':
        return 'Job';
      default:
        return type;
    }
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

  doAutofillBusiness() {
    const {businessId, organizationId, businessType} =
      this.service.business;
    if (businessId && organizationId) {
      this.$layoutSubscription.add(
        this.businessService
          .autofillBusiness(businessId, organizationId)
          .subscribe(
            () => {
              this.uiService.successMessage(
                'PitchCard successfully filled'
              );
              this.businessService
                .getBusinessDetail(businessId)
                .subscribe((r) => {
                  this.service.updateDraftBusiness(r.data);
                  this.service.$businessUpdated.next();
                  this.service.validateAllSteps();
                  if (
                    businessType === PitchCardType.Service
                  ) {
                    this.items.map((s, i) => {
                      if (s.value === Step.MoreInfo) {
                        s.visited =
                          this.autofillItems[
                            i
                            ].visited;
                      }
                    });
                  }
                });
            },
            (e) => this.uiService.errorMessage(e.message)
          )
      );
    }
  }

  downloadPC() {
    this.businessService
      .downloadPC(this.business.id, this.business.alias)
      .subscribe(
        (res) => {},
        (error) => {
          this.uiService.errorMessage(
            error?.message
              ? error.message
              : this.commonBindingService.getLabel('err_server')
          );
        }
      );
  }
}
