import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonBindingDataService } from '../../services/common-binding-data.service';
import { UiService } from '../../services/ui.service';
import { BusinessBankService } from '../../services/business-bank.service';
import { InputMask } from 'primeng/inputmask';
import { ConfirmationService } from 'primeng/api';
import { AppSettings } from '../../app.settings';
import { BankDetailModel } from '../../../bank-details/models/bank-detail.model';
import { bindCardLogo } from '../../utility-functions/card.utils';
import { CreatePitchCardService } from '../../../create-pitch-card/create-pitch-card.service';
import { BusinessService } from '../../../business/services/business.service';
import { BillingMethodType } from '../../../new-billing/services/new-billing.service';

@Component({
  selector: 'app-payment-method-forms',
  templateUrl: './payment-method-forms.component.html',
  styleUrls: ['./payment-method-forms.component.scss']
})
export class PaymentMethodFormsComponent
  implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  @Input() importCardDetail: any;
  @Input() importBankDetail: any;
  @Input() bothAvailable: boolean = true;
  @Input() allowRemoveMethods: boolean;
  @Input() cardError: any;
  @Input() achErrorMessage: string;

  @Input() isHaveChangesModel: boolean;
  @Output() isHaveChangesModelChange = new EventEmitter<boolean>();

  @Output() saveChanges: EventEmitter<any> = new EventEmitter();
  @Output() deleteCreditCard: EventEmitter<any> = new EventEmitter();
  @Output() deleteACH: EventEmitter<any> = new EventEmitter();

  @ViewChild('cardNumber') cardNumber: InputMask;

  bankAccountForm: FormGroup;
  cardVerification: FormGroup;

  creditCardMode = true;
  cardErrorMessage: string = null;
  cardManualError: string = '';
  month = AppSettings.MONTHS;
  yearList = [];
  monthList = [];
  years;
  months;
  $validation: Subscription;
  $cardValueChange = new Subscription();
  $bankAccountValueChange = new Subscription();

  isCardValid = false;
  isCardInvalid = false;
  validatingCard = false;
  isSetDeciaml = false;
  isACHValid = false;
  editBankAccountMode = false;
  holderType = [
    {
      label: 'Checking Account',
      value: 'checking'
    },
    {
      label: 'Savings Account',
      value: 'saving'
    }
  ];
  submitted = true;
  cvcMaxLength: number = 3;

  constructor(
    public createPitchCardService: CreatePitchCardService,
    private fb: FormBuilder,
    private commonBindingService: CommonBindingDataService,
    private confirmationService: ConfirmationService,
    private uiService: UiService,
    private bankService: BusinessBankService,
    private businessService: BusinessService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setDate();
    this.setSubmit();
  }

  ngAfterViewChecked() {
    const decimalInput = document.getElementsByClassName('p-inputtext');
    if (decimalInput.length && !this.isSetDeciaml) {
      Object.keys(decimalInput).forEach(function (key, index) {
        if (index < 3) {
          decimalInput[index].setAttribute('inputmode', 'decimal');
        }
      });
      this.isSetDeciaml = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.importBankDetail?.currentValue) {
      this.editBankAccount(this.importBankDetail ? true : false);
    }
    if (this.cardError) {
      this.importCardDetail = null;
      this.setCardFieldsValidation();
    }
    if (this.achErrorMessage) {
      this.editBankAccountMode = true;
      this.importBankDetail = null;
    }
  }

  ngOnDestroy(): void {
    if (this.$cardValueChange) {
      this.$cardValueChange.unsubscribe();
    }
    if (this.$bankAccountValueChange) {
      this.$bankAccountValueChange.unsubscribe();
    }
  }

  setCardFieldsValidation() {
    if (this.cardError.field) {
      this.cardManualError = '';
      if (this.cardError.field === 'number') {
        this.cardVerification
          .get('cardNumber')
          .setErrors({pattern: true});
      }
      if (this.cardError.field === 'cvv2') {
        this.cardVerification.get('cvc').setErrors({pattern: true});
      }
      if (this.cardError.field === 'expiry') {
        this.cardVerification.get('month').setErrors({pattern: true});
        this.cardVerification.get('year').setErrors({pattern: true});
      }
    } else {
      this.cardManualError = this.cardError?.message
        ? this.cardError.message
        : '';
    }
  }

  completeMethod(event, type) {
    if (type === 'month') {
      this.monthList = [...this.months];
      if (this.monthList.length === 1) {
        this.cardVerification.controls.month.setValue(
          this.monthList[0]
        );
      }
    }
    if (type === 'year') {
      this.yearList = [...this.years];
    }

    if (event.query) {
      if (type === 'month') {
        const suggestion = this.months.find(
          (x) =>
            x.value.toString() === event.query ||
            x.label.toString() === event.query
        );

        if (suggestion) {
          this.cardVerification.controls.month.setValue(suggestion);
        }
        if (event.query.includes('.')) {
          this.parseExpDate(event.query);
        }
      }

      if (type === 'year') {
        const suggestion = this.years.find(
          (x) => x.value.toString().indexOf(event.query) === 0
        );

        if (suggestion) {
          this.cardVerification.controls.year.setValue(suggestion);
        }
        if (event.query.includes('.')) {
          this.parseExpDate(event.query);
        }
      }
    }
  }

  parseExpDate(query: string): void {
    if (query.includes('.')) {
      const expDate = query.split('.');
      if (expDate?.length) {
        const ms = this.months.find(
          (x) =>
            x.value.toString() === expDate[0] ||
            x.label.toString() === expDate[0]
        );
        this.cardVerification.controls.month.setValue(ms);

        const ys = this.years.find(
          (x) => x.value.toString().indexOf(expDate[1]) === 0
        );
        this.cardVerification.controls.year.setValue(ys);
      }
    }
  }

  setCvcMaxLength() {
    if (/^3[47]/.test(this.cardVerification.value.cardNumber)) {
      this.cvcMaxLength = 4;
    } else {
      this.cvcMaxLength !== 3
        ? this.cardVerification.controls.cvc.reset()
        : null;
      this.cvcMaxLength = 3;
    }
  }

  setCardMaxLength(event) {
    if (/^3[47]/.test(event.target.value.trim())) {
      const buff = event.target.value.trim();
      this.cardNumber.mask = '9999 999999 99999';
      this.cardVerification.controls.cardNumber.setValue(buff);
      this.cardNumber.focus();
      event.target.setSelectionRange(
        event.target.value.trim().length,
        event.target.value.trim().length
      );
    } else {
      const buff = event.target.value.trim();
      this.cardNumber.mask = '9999 9999 9999 9999';
      this.cardVerification.controls.cardNumber.setValue(buff);
      this.cardNumber.focus();
      event.target.setSelectionRange(
        event.target.value.trim().length,
        event.target.value.trim().length
      );
    }
  }

  initializeForm() {
    this.cardVerification = this.fb.group({
      cardNumber: [null, Validators.required],
      month: [null, Validators.required],
      year: [null, Validators.required],
      cvc: [null, Validators.required]
    });

    this.bankAccountForm = this.fb.group({
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

    this.creditCardMode = this.importCardDetail ? true : false;
    if (!this.creditCardMode && !this.importBankDetail) {
      this.creditCardMode = true;
    }

    this.$cardValueChange.add(
      this.cardVerification.valueChanges.subscribe(() => {
        if (this.importCardDetail) {
          this.submitted = false;
        }
        Object.keys(this.cardVerification.value).map((key) => {
          if (
            this.cardVerification.value[key] &&
            this.cardVerification.value[key] != ''
          ) {
            this.isHaveChangesModelChange.emit(true);
            return;
          }
        });
      })
    );

    this.bankAccountForm.controls.account_holder_type.setValue(
      this.holderType[0].value
    );
    if (!this.creditCardMode) {
      this.editBankAccount(false);
    }
    this.$bankAccountValueChange.add(
      this.bankAccountForm.valueChanges.subscribe(() => {
        this.submitted = !this.bankAccountForm.valid;
      })
    );
  }

  editBankAccount(isEditMode) {
    this.bankAccountForm = this.fb.group({
      account_holder_name: [
        this.importBankDetail.accountHolderName,
        [
          Validators.required,
          Validators.pattern(AppSettings.NAME_PATTERN_WITH_SPACE)
        ]
      ],
      account_holder_type: [
        this.importBankDetail.accountHolderType,
        [Validators.required]
      ],
      routing_number: [
        this.importBankDetail.routingNumber,
        [
          Validators.required,
          Validators.pattern(AppSettings.DIGIT_PATTERN)
        ]
      ],
      account_number: [
        this.importBankDetail.accountNumber,
        [
          Validators.required,
          Validators.pattern(AppSettings.DIGIT_PATTERN)
        ]
      ],
      confirm_account_number: [
        this.importBankDetail.accountNumber,
        [
          Validators.required,
          this.AcountNumberValidator('account_number')
        ]
      ]
    });

    this.editBankAccountMode = isEditMode;
  }

  deleteBankAccount() {
    this.confirmationService.confirm({
      message: this.commonBindingService.getLabel('confirm_remove_ach'),
      header: this.commonBindingService.getLabel('lbl_remove_ach_title'),
      accept: () => {
        this.deleteACH.emit(
          this.importBankDetail ? this.importBankDetail : null
        );
        this.importBankDetail = null;
        this.bankAccountForm.reset();
        this.submitted = false;
      }
    });
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

  getRealValue(code): number {
    if (!!code) {
      return code.match(/\d+/g).map(Number)[0];
    } else {
      return 0;
    }
  }

  getValue(field) {
    if (!this.cardVerification.value[field]) {
      return null;
    }
    if (this.cardVerification.value[field].label) {
      return this.cardVerification.value[field].value;
    } else {
      return this.cardVerification.get(field).value;
    }
  }

  validateBankAccount() {
    if (this.validatingCard) {
      this.saveChanges.emit(null);
      return;
    }

    if (this.bankAccountForm.valid) {
      const bankDetailModel =
        this.importBankDetail || new BankDetailModel();
      bankDetailModel.accountNumber =
        this.bankAccountForm.value.account_number;
      bankDetailModel.routingNumber =
        this.bankAccountForm.value.routing_number;
      bankDetailModel.accountHolderName =
        this.bankAccountForm.value.account_holder_name;
      bankDetailModel.accountHolderType =
        this.bankAccountForm.value.account_holder_type;
      bankDetailModel.id =
        this.importBankDetail && this.importBankDetail.id
          ? this.importBankDetail.id
          : '';
      bankDetailModel.billingMethod = BillingMethodType.BankAccount;
      this.validatingCard = true;

      this.submitted = true;

      this.saveChanges.emit(bankDetailModel);
      this.importBankDetail = bankDetailModel;

      setTimeout(() => {
        this.validatingCard = false;
        this.editBankAccountMode = false;
      }, 1500);
    } else {
      this.saveChanges.emit(null);
    }
  }

  validateCard() {
    if (this.validatingCard) {
      this.saveChanges.emit(null);
      return;
    }
    const getCardNumber = this.getRealValue(
      this.cardVerification.value.cardNumber
    );

    const month = new Date().getMonth() + 1;

    const year = new Date().getFullYear();

    let selectedYear = this.getValue('year');

    const selectedMonth = this.getValue('month');

    if (selectedYear?.length === 2) {
      selectedYear = parseInt('20' + selectedYear, 10);
    }

    if (selectedMonth && selectedYear) {
      if (selectedMonth + selectedYear * 12 < month + year * 12) {
        this.validatingCard = false;
        this.cardVerification.controls.year.setErrors({
          pattern: true
        });
        this.cardVerification.controls.month.setErrors({
          pattern: true
        });
        return;
      } else {
        this.cardVerification.controls.year.setErrors(null);
        this.cardVerification.controls.month.setErrors(null);
      }
    } else {
      this.saveChanges.emit(null);
      return;
    }

    if (
      getCardNumber.toString().length < 16 &&
      /^3[47]/.test(this.cardVerification.value.cardNumber) &&
      getCardNumber.toString().length < 15
    ) {
      this.isCardValid = false;
      this.cardVerification
        .get('cardNumber')
        .setErrors({pattern: true});
      this.validatingCard = false;
      return;
    }

    if (this.cardVerification.invalid) {
      this.validatingCard = false;
      return;
    }

    this.isCardValid = false;
    this.isCardInvalid = false;
    this.validatingCard = true;

    const cardValue = {
      number: this.cardVerification.value.cardNumber,
      expiry: this.formatExpiry(selectedMonth, selectedYear),
      cvv2: this.cardVerification.value.cvc,
      billingMethod: BillingMethodType.CreditCard
    };

    this.cardVerification.updateValueAndValidity();

    this.saveChanges.emit(cardValue);
    setTimeout(() => {
      this.validatingCard = false;
      this.submitted = true;
    }, 1500);
  }

  responseHandler(status, response) {
    this.cardErrorMessage = null;
    if (status === 200) {
      this.cardErrorMessage = 'Validation success';
      this.cardVerification.setErrors(null);
    }
    if (status === 402) {
      if (response.error.code === 'card_declined') {
        this.cardErrorMessage = response.error.message;
      } else if (response.error.code === 'incorrect_number') {
        this.cardErrorMessage = response.error.message;
        this.cardVerification
          .get('cardNumber')
          .setErrors({pattern: true});
      } else if (response.error.code === 'invalid_expiry_month') {
        this.cardErrorMessage = response.error.message;
        this.cardVerification.get('month').setErrors({pattern: true});
        this.cardVerification.get('year').setErrors({pattern: true});
      } else if (response.error.code === 'invalid_cvc') {
        this.cardVerification
          .get('securityCode')
          .setErrors({pattern: true});
      } else {
        this.cardErrorMessage = this.commonBindingService.getLabel(
          'lbl_card_details_invalid'
        );
      }
      this.cardVerification.setErrors({invalid: true});
    }

    // EMIT event here to pass data from the stripe response
    this.postCardSave(response);
  }

  removeCard() {
    this.confirmationService.confirm({
      message: this.commonBindingService.getLabel('confirm_update_card'),
      header: this.commonBindingService.getLabel(
        'label_update_card_title'
      ),
      accept: () => {
        this.deleteCreditCard.emit(
          this.importCardDetail ? this.importCardDetail : null
        );
        this.importCardDetail = null;
        this.cardVerification.reset();
        this.submitted = false;
      }
    });
  }

  changePaymentOption() {
    this.creditCardMode = !this.creditCardMode;
    this.submitted = !this.creditCardMode
      ? !this.bankAccountForm.valid
      : !this.cardVerification.valid;
    if (!this.creditCardMode && this.importBankDetail) {
      this.editBankAccount(false);
    }
  }

  formatExpiry(month: number, year: number) {
    const strMonth = month > 9 ? month.toString() : '0' + month.toString();

    return strMonth + year.toString().substr(2, 2);
  }

  postCardSave(event) {
    if (event.error) {
      this.uiService.errorMessage(event.error.message);
      this.isCardInvalid = true;
      this.cardErrorMessage = event.error.message;
      setTimeout(() => {
        this.validatingCard = false;
        this.isCardInvalid = false;
        this.cardErrorMessage = null;
        this.changeDetectorRef.detectChanges();
      }, 5000);
    } else {
      const card = event.card;
      card.stripeToken = event.id;
      card.isDefaultCard = true;
      card.isCardDelete = false;
      card.type = BillingMethodType.CreditCard;

      card.logoUrl = bindCardLogo(card.brand);
      this.saveChanges.emit(card);
    }
  }

  setDate() {
    const currentYear = new Date().getFullYear();
    const yearList = [];
    const monthList = [];

    for (let i = 0; i <= 11; i++) {
      yearList.push({name: currentYear + i, value: currentYear + i});
      monthList.push({name: this.month[i], value: i + 1});
    }
    this.years = this.createPitchCardService.setDropDown(
      yearList,
      'name',
      'value'
    );
    this.months = this.createPitchCardService.setDropDown(
      monthList,
      'name',
      'value'
    );
    this.yearList = [...this.years];
    this.monthList = [...this.months];

    this.responseHandler = this.responseHandler.bind(this);
  }

  setSubmit() {
    if (this.creditCardMode) {
      this.submitted = !this.cardVerification.valid;
    } else {
      this.submitted = !this.bankAccountForm.valid;
    }
  }
}
