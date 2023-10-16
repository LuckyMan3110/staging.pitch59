import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Observable, Subscription } from 'rxjs';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { PricingProduct } from '../../../new-billing/model/pricing-product';
import { TransactionModel } from '../../../new-billing/model/transaction.model';
import {
  BillingFrequency,
  BillingMethodType,
  NewBillingService
} from '../../../new-billing/services/new-billing.service';
import { BusinessStatus } from '../../../business/enums/business.status';
import { TransactionErrorType } from '../../../new-billing/enums/transaction-errors.enum';
import { PitchCardType } from '../../../shared/enums/pitch-card-type.enum';
import { Table } from 'primeng/table';
import { ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { CommonBindingDataService } from '../../../shared/services/common-binding-data.service';
import { BusinessService } from '../../../business/services/business.service';
import { BusinessBankService } from '../../../shared/services/business-bank.service';
import { CardPackageService } from '../../../cards-packages/services/card-package.service';
import { UiService } from '../../../shared/services/ui.service';
import { StorageService } from '../../../shared/services/storage.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AppSettings } from '../../../shared/app.settings';
import { BankDetailModel } from '../../../bank-details/models/bank-detail.model';
import { CardDetailModel } from '../../../shared/models/card-detail.model';
import {
  CreateEmployerPortalService,
  Step
} from '../../../create-employer-portal/create-employer-portal.service';
import { Router } from '@angular/router';
import { CreatePitchCardService } from '../../../create-pitch-card/create-pitch-card.service';
import { EmployerPortalService } from '../../../choosen-history/services/employer-portal.service';
import { ProductType } from '../../../shared/components/pricing-menu-components/pricing-menu.service';

@Component({
  selector: 'app-choose-plan',
  templateUrl: './choose-plan.component.html',
  styleUrls: ['./choose-plan.component.scss'],
  animations: [
    trigger('rowExpansionTrigger', [
      state(
        'void',
        style({
          transform: 'translateX(-10%)',
          opacity: 0
        })
      ),
      state(
        'active',
        style({
          transform: 'translateX(0)',
          opacity: 1
        })
      ),
      transition(
        '* <=> *',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      )
    ])
  ]
})
export class ChoosePlanComponent implements OnInit, OnDestroy {
  $businessUpdate: Subscription;
  $validation: Subscription;
  $cardValueChange: Subscription;
  $useBillingAddressChange: Subscription;
  $paymentSubscription = new Subscription();

  cardVerification: FormGroup;
  bankAccountForm: FormGroup;

  creditCardMode = true;
  isOrganization: boolean;

  validatingCard = false;
  cardIsValidated = false;
  submitted = false;
  month = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12'
  ];
  yearList = [];
  monthList = [];
  years;
  months;
  isCardValid = false;
  isCardInvalid = false;
  editBankAccountMode = false;
  isACHValid = false;
  handlePaymentMethods: boolean = false;
  handlePaymentFailedMethods: boolean = false;
  canRemoveCreditCard: boolean = false;
  isHaveChanges: boolean;
  isDesktop: boolean = this.deviceService.isDesktop();
  isMobile: boolean = this.deviceService.isMobile();
  cardErrorMessage: any;
  achErrorMessage: string;
  paymentErrorReason: null | string;

  referErrorMessage;

  holderType = [];
  filteredStatesList = [];
  columns: any[] = [];
  expandColumns: any[] = [];

  businessType: string;
  package: PricingProduct;
  virtualVideo: PricingProduct;
  transactions: TransactionModel[];
  notApprovedTransactions = [];
  billingFrequencyModel = BillingFrequency;
  businessStatusesEnum = BusinessStatus;
  transactionsErrors = TransactionErrorType;
  pitchCardTypes = PitchCardType;
  removeBankAccountObject: any;

  rows = 20;
  totalRecords = 0;
  first = 0;

  service: CreatePitchCardService | CreateEmployerPortalService;
  tableCellsStyle = 'display: table-cell !important;';

  @ViewChild('dt') table: Table;

  constructor(
    private router: Router,
    public createPitchCardService: CreatePitchCardService,
    public createEmployerPortalService: CreateEmployerPortalService,
    private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder,
    private commonBindingService: CommonBindingDataService,
    private changeDetectorRef: ChangeDetectorRef,
    private businessService: BusinessService,
    private bankService: BusinessBankService,
    private cardPackageService: CardPackageService,
    private uiService: UiService,
    private storageService: StorageService,
    private billService: NewBillingService,
    private deviceService: DeviceDetectorService,
    private employerService: EmployerPortalService
  ) {
    this.populateColumns();
    this.service =
      this.router.url.includes('create') &&
      !this.router.url.includes('createType')
        ? this.createPitchCardService
        : this.createEmployerPortalService;
    this.isOrganization =
      this.service.businessType == PitchCardType.EmployerPortal;
  }

  loadTransactionsLazy(event?: LazyLoadEvent) {
    this.$paymentSubscription.add(
      this.getTransactions(event).subscribe(
        (x: any) => {
          if (x.data) {
            this.transactions = x.data.records;
            this.totalRecords = x.data.pagination
              ? x.data.pagination.totalRecords
              : 0;
            this.paymentErrorReason = x.data.errorsReasons.length
              ? x.data.errorsReasons.join(' , ')
              : null;
          }
        },
        (e) => {
          if (e.Message) {
            this.uiService.errorMessage(e.Message);
          }
        }
      )
    );
  }

  getTransactions(e): Observable<any> {
    this.rows = e.rows;
    this.first = e.first;
    if (this.service.businessId && !this.isOrganization) {
      return this.billService.getPaidTransactions(
        this.service.businessId,
        this.rows,
        this.first
      );
    }

    if (this.service.businessId && this.isOrganization) {
      return this.billService.getOrganizationTransactions(
        this.service.businessId,
        this.rows,
        this.first
      );
    }
  }

  ngOnInit() {
    this.service.currentStep = Step.Billing;

    if (this.service.loaded) {
      this.initializeForm();
      this.service.changeCurrentSectionVisited();
    }

    this.$businessUpdate = this.service.$businessUpdated.subscribe(() => {
      this.initializeForm();
    });

    this.$validation = this.service.$validateSection.subscribe((step) => {
      if (step === Step.Billing) {
        this.service.changeCurrentSectionCompleted(
          !!this.service.cardDetail ||
          !!this.service.bankDetail ||
          !!this.service.isAppPayment
        );
        this.service.currentStep = this.service.moveToStep;
      }
    });

    this.setBusinessType();
    // this.getProduct(this.businessType, this.service.paymentPlan?.paymentFrequency,
    //     this.service.paymentPlan?.type);
    this.getProduct('virtualVideo');

    const currentYear = new Date().getFullYear();
    const yearList = [];
    const monthList = [];

    for (let i = 0; i <= 11; i++) {
      yearList.push({name: currentYear + i, value: currentYear + i});
      monthList.push({name: this.month[i], value: i + 1});
    }
    this.years = this.service.setDropDown(yearList, 'name', 'value');
    this.months = this.service.setDropDown(monthList, 'name', 'value');
    this.yearList = [...this.years];
    this.monthList = [...this.months];
  }

  populateColumns() {
    if (this.isDesktop) {
      this.columns.push({
        field: 'date',
        header: 'Date',
        sort: false,
        resize: false,
        width: this.fixColumnWidth('auto', 'auto', 'auto')
      });
      this.columns.push({
        field: 'productName',
        header: 'Item Name',
        sort: false,
        resize: false,
        width: '20%'
      });
      this.columns.push({
        field: 'quantity',
        header: 'Quantity',
        sort: false,
        resize: false,
        width: 'auto'
      });
      this.columns.push({
        field: 'singlePrice',
        header: 'Price/Item',
        sort: false,
        resize: false,
        width: 'auto'
      });
      this.columns.push({
        field: 'amount',
        header: 'Total',
        sort: false,
        resize: false,
        width: 'auto'
      });
      this.columns.push({
        field: 'status',
        header: 'Status',
        sort: false,
        resize: false,
        width: 'auto'
      });
      this.columns.push({
        field: 'pdf',
        header: '',
        sort: false,
        resize: false,
        width: 'auto'
      });
      this.columns.push({
        field: 'arrow',
        header: '',
        sort: false,
        resize: false,
        width: '3rem'
      });

      this.expandColumns.push({
        field: 'key',
        header: '',
        sort: false,
        resize: false,
        width: 'auto'
      });
    } else {
      this.columns.push({
        field: 'date',
        header: 'Date',
        sort: false,
        resize: false,
        width: 'auto'
      });
      this.columns.push({
        field: 'amount',
        header: 'Total',
        sort: false,
        resize: false,
        width: 'auto'
      });
      this.columns.push({
        field: 'status',
        header: 'Status',
        sort: false,
        resize: false,
        width: 'auto'
      });
      this.columns.push({
        field: 'pdf',
        header: 'PDF',
        sort: false,
        resize: false,
        width: '15%'
      });
      this.expandColumns = [];
    }
  }

  fixColumnWidth(mobile?, tablet?, desktop?) {
    if (this.deviceService.isMobile()) {
      return mobile;
    }
    if (this.deviceService.isTablet()) {
      return tablet;
    }
    if (this.deviceService.isDesktop()) {
      return desktop;
    }
  }

  setBusinessType() {
    this.businessType = this.service.businessType;
  }

  getProduct(productType, paymentFrequency?, type?: ProductType) {
    if (this.service.businessId) {
      this.$paymentSubscription.add(
        this.cardPackageService
          .getActivePricingByBusinessType(
            productType,
            paymentFrequency,
            type
          )
          .subscribe((r) => {
            if (paymentFrequency) {
              this.package = r.data[0];
            } else {
              this.virtualVideo = r.data[0];
            }
          })
      );
    }
  }

  initializeForm() {
    this.holderType = [
      {label: 'Checking Account', value: 'checking'},
      {label: 'Savings Account', value: 'saving'}
    ];

    this.cardVerification = this.formBuilder.group({
      cardNumber: [null, Validators.required],
      month: [null, Validators.required],
      year: [null, Validators.required],
      cvc: [null, Validators.required]
    });

    this.bankAccountForm = this.formBuilder.group({
      account_holder_name: [
        '',
        [
          Validators.required,
          Validators.pattern(AppSettings.NAME_PATTERN_WITH_SPACE)
        ]
      ],
      account_holder_type: [null, [Validators.required]],
      routing_number: [
        '',
        [
          Validators.required,
          Validators.pattern(AppSettings.DIGIT_PATTERN),
          Validators.minLength(9)
        ]
      ],
      account_number: [
        '',
        [
          Validators.required,
          Validators.pattern(AppSettings.DIGIT_PATTERN),
          Validators.minLength(9)
        ]
      ],
      confirm_account_number: [
        '',
        [
          Validators.required,
          this.AcountNumberValidator('account_number')
        ]
      ]
    });

    this.creditCardMode = !this.service.bankDetail;
    this.bankAccountForm.controls.account_holder_type.setValue(
      this.holderType[0].value
    );
    this.service.tileRequiredState =
      !!this.service.cardDetail ||
      !!this.service.bankDetail ||
      !!this.service.isAppPayment;
  }

  editBankAccount() {
    this.bankAccountForm = this.formBuilder.group({
      account_holder_name: [
        this.service.bankDetail.accountHolderName,
        [
          Validators.required,
          Validators.pattern(AppSettings.NAME_PATTERN_WITH_SPACE)
        ]
      ],
      account_holder_type: [
        this.service.bankDetail.accountHolderType,
        [Validators.required]
      ],
      routing_number: [
        this.service.bankDetail.routingNumber,
        [
          Validators.required,
          Validators.pattern(AppSettings.DIGIT_PATTERN)
        ]
      ],
      account_number: [
        this.service.bankDetail.accountNumber,
        [
          Validators.required,
          Validators.pattern(AppSettings.DIGIT_PATTERN)
        ]
      ],
      confirm_account_number: [
        '',
        [
          Validators.required,
          this.AcountNumberValidator('account_number')
        ]
      ]
    });

    this.editBankAccountMode = true;
  }

  ngOnDestroy(): void {
    if (this.$validation) {
      this.$validation.unsubscribe();
    }
    if (this.$cardValueChange) {
      this.$cardValueChange.unsubscribe();
    }
    if (this.$businessUpdate) {
      this.$businessUpdate.unsubscribe();
    }
    if (this.$useBillingAddressChange) {
      this.$useBillingAddressChange.unsubscribe();
    }
    if (this.$paymentSubscription) {
      this.$paymentSubscription.unsubscribe();
    }
  }

  AcountNumberValidator(confirmAccountNumberInput: string) {
    let confirmAccountNumberControl: FormControl;
    let accountNumberControl: FormControl;

    return (control: FormControl) => {
      if (!control.parent) {
        return null;
      }

      if (!confirmAccountNumberControl) {
        confirmAccountNumberControl = control;
        accountNumberControl = control.parent.get(
          confirmAccountNumberInput
        ) as FormControl;
        accountNumberControl.valueChanges.subscribe(() => {
          confirmAccountNumberControl.updateValueAndValidity();
        });
      }

      if (
        accountNumberControl.value &&
        accountNumberControl.value !== confirmAccountNumberControl.value
      ) {
        return {
          notMatch: true
        };
      }
      return null;
    };
  }

  getBankAccountRoute(bankDetailModel: BankDetailModel): Observable<any> {
    if (!this.service.bankDetail) {
      return this.bankService.addNewBankAccountDetails(
        this.service.businessId,
        this.billService.populateAchObject(bankDetailModel)
      );
    } else {
      return this.bankService.updateBankAccountDetails(
        this.service.businessId,
        this.billService.populateAchObject(bankDetailModel)
      );
    }
  }

  addSecurityToPayment(code) {
    if (code) {
      return (
        'X'.repeat(code.length - 4) + code.substr(code.length - 4, 4)
      );
    }
  }

  removeCard() {
    this.confirmationService.confirm({
      message: this.commonBindingService.getLabel('confirm_remove_card'),
      header: this.commonBindingService.getLabel(
        'label_remove_card_title'
      ),
      accept: () => {
        this.businessService
          .deleteCard(
            this.service.businessId,
            this.service.cardDetail
          )
          .subscribe(
            (result) => {
              this.service.cardDetail = null;
              this.cardVerification.reset();
              this.service.changeCurrentSectionCompleted(
                !!this.service.cardDetail ||
                !!this.service.bankDetail ||
                !!this.service.isAppPayment
              );
            },
            (error) => {
              this.uiService.errorMessage(error.Message);
            }
          );
      }
    });
  }

  getNextMonthDate() {
    const today = new Date();
    return new Date(today.setMonth(today.getMonth() + 1, today.getDate()));
  }

  acceptModal() {
    if (this.isHaveChanges) {
      this.confirmationService.confirm({
        rejectButtonStyleClass: 'bg-darkgray',
        message: this.commonBindingService.getLabel(
          'message_lost_changes'
        ),
        header: this.commonBindingService.getLabel(
          'label_lost_changes'
        ),
        accept: () => {
          this.handlePaymentMethods = false;
          this.isHaveChanges = false;
          this.cardErrorMessage = null;
        },
        reject: () => {
          this.handlePaymentMethods = true;
        }
      });
    } else {
      this.handlePaymentMethods = false;
      this.isHaveChanges = false;
      this.cardErrorMessage = null;
    }
  }

  saveChanges(data) {
    if (this.removeBankAccountObject && this.removeBankAccountObject.id) {
      this.achErrorMessage = '';
      this.$paymentSubscription.add(
        this.bankService
          .deleteBankAccountDetails(this.service.businessId)
          .subscribe(
            (r) => {
              this.uiService.successMessage(
                r.message
                  ? r.message
                  : 'Bank Account has been removed'
              );
              this.removeBankAccountObject = {};
              this.service.bankDetail = null;
              this.isHaveChanges = false;
              this.storageService.removeItem(
                AppSettings.USER_BANK_DETAILS
              );
              if (!data) {
                this.handlePaymentMethods = false;
              }
            },
            (e) => {
              if (e.Message) {
                this.uiService.errorMessage(e.Message);
                this.achErrorMessage = e.Message
                  ? e.Message
                  : 'Oops';
              }
            }
          )
      );
    }
    if (data) {
      if (data.billingMethod === BillingMethodType.BankAccount) {
        this.saveBankDetailChanges(data);
      }
      if (data.billingMethod === BillingMethodType.CreditCard) {
        this.saveCreditCardChanges(data);
      }
    }
  }

  saveBankDetailChanges(bankDetails) {
    this.achErrorMessage = '';
    if (bankDetails) {
      this.$paymentSubscription.add(
        this.getBankAccountRoute(bankDetails).subscribe(
          (result) => {
            this.handlePaymentMethods = false;
            if (bankDetails) {
              this.service.bankDetail = bankDetails;
            }
            this.isHaveChanges = false;

            if (result.message) {
              this.uiService.successMessage(result.message);
            }
          },
          (e) => {
            if (e.message) {
              this.uiService.errorMessage(e.message);
            }
            this.achErrorMessage = e.message ? e.message : 'Oops';

            setTimeout(() => {
              this.changeDetectorRef.detectChanges();
            }, 5000);
          }
        )
      );
    }
  }

  saveCreditCardChanges(cardDetails) {
    this.cardErrorMessage = null;
    if (cardDetails) {
      delete cardDetails.billingMethod;
      this.$paymentSubscription.add(
        this.addNewFullCardDetails(cardDetails).subscribe(
          (result) => {
            this.handlePaymentMethods = false;
            if (cardDetails) {
              this.service.cardDetail = {
                stripeToken: cardDetails.number,
                expYear: 20 + cardDetails.expiry.slice(2),
                expMonth: cardDetails.expiry.substring(0, 2),
                last4: cardDetails.number.substr(
                  cardDetails.number.length - 4,
                  4
                )
              } as CardDetailModel;
            }

            this.storageService.setItem(
              AppSettings.PAYMENT_REQUEST,
              {code: 200}
            );

            this.service.$paymentApproveModal.next(true);
            this.service.business.businessStatus =
              this.businessStatusesEnum.Active;

            this.loadTransactionsLazy();
            this.getPaymentPlan();
            this.fetchOrganization();

            setTimeout(() => {
              this.isHaveChanges = false;
              this.changeDetectorRef.detectChanges();
            }, 3000);
          },
          (err) => {
            if (err && err.code == AppSettings.PAYMENT_FAILED) {
              this.service.cardDetail = err.data
                ? err.data
                : ({
                  stripeToken: cardDetails.number,
                  expYear: 20 + cardDetails.expiry.slice(2),
                  expMonth: cardDetails.expiry.substring(
                    0,
                    2
                  ),
                  last4: cardDetails.number.substr(
                    cardDetails.number.length - 4,
                    4
                  )
                } as CardDetailModel);

              this.handlePaymentMethods = false;
              this.isHaveChanges = false;
              this.cardErrorMessage = null;
              this.storageService.setItem(
                AppSettings.PAYMENT_REQUEST,
                err
              );
              this.service.business.businessStatus =
                this.businessStatusesEnum.PaymentFailed;

              this.service.$paymentApproveModal.next(true);
            } else {
              this.cardErrorMessage = err;
              if (err && err.message) {
                this.uiService.errorMessage(err.message);
              }
            }
            this.getPaymentPlan();
            this.loadTransactionsLazy();
            this.fetchOrganization();
            setTimeout(() => {
              this.changeDetectorRef.detectChanges();
            }, 5000);
          }
        )
      );
    }
  }

  addNewFullCardDetails(cardDetails) {
    if (this.isOrganization) {
      return this.employerService.addCardDetail(
        this.service.businessId,
        cardDetails
      );
    } else {
      return this.businessService.addNewFullCardDetails(
        this.service.businessId,
        cardDetails
      );
    }
  }

  fetchOrganization() {
    if (this.isOrganization) {
      this.employerService.$fetchEmployerPortalInfo.next(true);
    }
  }

  populateBankDetailRemoveObj(ach) {
    if (!ach.id) {
      const savedObj = JSON.parse(
        this.storageService.getItem(AppSettings.USER_BANK_DETAILS)
      );
      ach.id = savedObj && savedObj.id ? savedObj.id : null;
    }
    this.removeBankAccountObject = {id: ach.id};
  }

  initDownload(id, options?) {
    const {groupAttempt, type} = options;
    if (!this.isOrganization) {
      this.$paymentSubscription.add(
        this.billService.downloadPdf(id).subscribe(
          (r) => {
            this.uiService.successMessage(
              r.Message
                ? r.Message
                : 'Receipt successfully downloaded'
            );
          },
          (error) => {
            this.uiService.errorMessage(
              error.Message
                ? error.Message
                : this.commonBindingService.getLabel(
                  'err_server'
                )
            );
          }
        )
      );
    } else {
      if (this.isOrganization) {
        this.$paymentSubscription.add(
          this.billService
            .saveReceiptForOrganization(groupAttempt, type)
            .subscribe(
              (r) => {
                this.uiService.successMessage(
                  r?.Message ? r.Message : 'Download Init'
                );
              },
              (error) => {
                this.uiService.errorMessage(
                  error?.Message
                    ? error.Message
                    : this.commonBindingService.getLabel(
                      'err_server'
                    )
                );
              }
            )
        );
      }
    }
  }

  handleRetryPaymentModal() {
    this.confirmationService.confirm({
      rejectButtonStyleClass: 'bg-darkgray',
      acceptLabel: 'Charge',
      rejectLabel: 'Cancel',
      header: `We will attempt to charge your account again for $${this.service.paymentPlan.amount.toFixed(
        2
      )}.`,
      accept: () => {
        this.retryPayment();
      },
      reject: () => {
        this.confirmationService.close();
      }
    });
  }

  retryPayment() {
    this.$paymentSubscription.add(
      this.billService.retryPayment(this.service.businessId).subscribe(
        () => {
          this.storageService.setItem(AppSettings.PAYMENT_REQUEST, {
            code: 200
          });
          this.service.$paymentApproveModal.next(true);
          this.service.business.businessStatus =
            this.businessStatusesEnum.Active;
          this.loadTransactionsLazy();
          this.getPaymentPlan();
        },
        (e) => {
          this.storageService.setItem(AppSettings.PAYMENT_REQUEST, e);
          this.service.$paymentApproveModal.next(true);
          this.loadTransactionsLazy();
          this.getPaymentPlan();
        }
      )
    );
  }

  getPaymentPlan() {
    this.$paymentSubscription.add(
      this.calculatePaymentPlanRoute().subscribe((paymentPlan) => {
        if (paymentPlan.data) {
          this.service.paymentPlan = paymentPlan.data.paid
            ? paymentPlan.data.paid
            : paymentPlan.data.notPaid;
        }
      })
    );
  }

  calculatePaymentPlanRoute(): Observable<any> {
    if (!this.isOrganization) {
      return this.businessService.getPaymentPlan(this.service.businessId);
    }

    if (this.isOrganization) {
      return this.billService.getOrganizationPaymentPlan(
        this.service.businessId
      );
    }
  }

  isApproveTransaction(id) {
    if (
      this.notApprovedTransactions &&
      this.notApprovedTransactions.length
    ) {
      return this.notApprovedTransactions.find((t) => t === id);
    } else {
      return false;
    }
  }

  getBusinessTypeValue(): string {
    return this.cardPackageService.getBusinessTypeValue(this.businessType);
  }
}
