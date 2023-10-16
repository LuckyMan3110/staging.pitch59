import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { UserModel } from '../../models/user.model';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { AppSettings } from '../../app.settings';
import { Subscription } from 'rxjs';
import { Admin } from '../../../choosen-history/services/employer-portal.service';

@Component({
  selector: 'app-assign-user-list',
  templateUrl: './assign-users.component.html',
  styleUrls: ['./assign-users.component.scss']
})
export class AssignUsersComponent implements OnInit, OnChanges, OnDestroy {
  @Input() assignedUsers: Admin[];
  @Input() superAdminId: number;
  @Input() errorsConfig: any[] = [];

  @Output() saveChange = new EventEmitter<UserModel[]>();
  @Output() deleteUsers = new EventEmitter<UserModel[]>();

  @ViewChild('userContainer') userContainer: ElementRef;

  form: FormGroup;
  inputItems: FormArray;
  $assignUserSubscribe = new Subscription();
  isSubmit: boolean = false;
  addAdditionalAdminsModal: boolean = false;

  errorMessage: string = '';
  additionalNumberOfAdmins: number = 2;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.formInit();
    this.setInputItems();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.assignedUsers?.currentValue && this.inputItems) {
      this.updateInputs(changes.assignedUsers.currentValue);
    }
  }

  ngOnDestroy(): void {
    if (this.$assignUserSubscribe) {
      this.$assignUserSubscribe.unsubscribe();
    }
  }

  formInit() {
    this.form = this.fb.group({
      inputItems: this.fb.array([])
    });

    this.inputItems = this.form.get('inputItems') as FormArray;
  }

  setInputItems() {
    if (this.assignedUsers && this.assignedUsers.length > 0) {
      this.assignedUsers.map((adminObject) => {
        if (adminObject.user) {
          this.inputItems.push(
            this.fb.group(
              {
                emailId: new FormControl(
                  adminObject.user?.emailId,
                  Validators.pattern(
                    AppSettings.EMAIL_PATTERN
                  )
                ),
                id: new FormControl(
                  adminObject.user.id
                    ? adminObject.user.id
                    : 0
                ),
                userId: new FormControl(
                  adminObject.userId ? adminObject.userId : 0
                ),
                isCharged: new FormControl(true)
              },
              {updateOn: 'submit'}
            )
          );
        } else {
          this.setEmptyInput(true);
        }
      });
    }
  }

  setEmptyInput(isCharged) {
    this.inputItems.push(
      this.fb.group({
        emailId: new FormControl(
          '',
          Validators.pattern(AppSettings.EMAIL_PATTERN)
        ),
        id: new FormControl(''),
        userId: new FormControl(''),
        isCharged: new FormControl(isCharged)
      })
    );
  }

  updateInputs(assignedUsers) {
    const notPaidUsers = [];
    const paidUsers = [];

    assignedUsers.map((u) => {
      if (!u.user?.id) {
        notPaidUsers.push(u);
      } else {
        paidUsers.push(u);
      }
    });

    this.setNotPaidUsers(notPaidUsers);
    this.setPaidUsers(paidUsers);
    this.inputItems.controls.forEach((input) => {
      if (input.get('isCharged').value) {
        input.markAsPristine();
      }
    });
  }

  clearInput(user, index) {
    if (user.value?.userId) {
      this.deleteUsers.emit(user.value);
      this.inputItems.get(index.toString()).get('emailId').patchValue('');
    } else {
      this.inputItems.get(index.toString()).get('emailId').patchValue('');
    }
  }

  saveChanges(e) {
    e.preventDefault();
    this.isSubmit = true;

    const duplicates = this.checkOnDuplicates();

    if (this.inputItems.valid && !duplicates.length) {
      const notPaidUsers = [];
      this.inputItems.controls.map((u) => {
        if (u.dirty) {
          notPaidUsers.push(u.value);
        }
      });
      this.saveChange.emit(notPaidUsers);
    }
  }

  checkOnDuplicates() {
    const emailValues = this.inputItems.value.map((input) => input.emailId);
    const duplicateValues = [];

    emailValues.some((item, idx) => {
      if (item && emailValues.indexOf(item) !== idx) {
        duplicateValues.push(item);
      }
    });

    if (duplicateValues.length) {
      this.inputItems.controls.map((control) => {
        if (
          duplicateValues.find(
            (i) => i === control.get('emailId').value
          ) !== undefined &&
          control.get('emailId').value
        ) {
          control.get('emailId').setErrors({duplicate: true});
          control.get('emailId').markAsTouched();
          this.inputItems.controls[0]
            .get('emailId')
            .markAsUntouched();
        }
      });
    }
    return duplicateValues;
  }

  addMoreInputs() {
    const numberOfInputs =
      this.inputItems.length + this.additionalNumberOfAdmins;
    while (this.inputItems.length < numberOfInputs) {
      this.setEmptyInput(false);
    }

    this.addAdditionalAdminsModal = false;
  }

  setNotPaidUsers(notApprovedEmails: any[]) {
    notApprovedEmails.map((user) => {
      if (
        this.inputItems.value.find(
          (i) => i.emailId === user?.user?.emailId
        )
      ) {
        this.inputItems.value.map((item, index) => {
          if (item.emailId === user?.user?.emailId) {
            this.inputItems
              .get(index.toString())
              .get('emailId')
              .setErrors({failed: true});
            this.inputItems
              .get(index.toString())
              .get('isCharged')
              .patchValue(false);
            const errMessage = this.errorsConfig.find(
              (e) => e.body === item.emailId
            )?.message;
            this.errorMessage = errMessage
              ? errMessage
              : 'err_invalid_emailId';
          }
        });
      }
    });
  }

  setPaidUsers(paidUsers) {
    paidUsers.map((user) => {
      this.inputItems.value.map((item, index) => {
        if (item.emailId === user?.body && user?.status) {
          this.inputItems
            .get(index.toString())
            .get('isCharged')
            .patchValue(true);
        }
      });
    });
  }

  setInputAsValid() {
    this.inputItems.controls.map((control) => {
      if (
        control.get('emailId').errors?.notPaid ||
        control.get('emailId').errors?.failed ||
        control.get('emailId').errors?.duplicate
      ) {
        control.get('emailId').setErrors(null);
        control.markAsDirty();
      }
      this.errorMessage = '';
    });
  }

  setInputValue(value, index) {
    this.inputItems.get(index.toString()).get('emailId').patchValue(value);
    this.inputItems.get(index.toString()).get('id').patchValue('');
    this.inputItems
      .get(index.toString())
      .get('isCharged')
      .patchValue(false);
    this.inputItems.get(index.toString()).markAsDirty();
  }
}
