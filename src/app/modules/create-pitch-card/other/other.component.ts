import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormArray,
  FormControl,
  AbstractControl,
  FormControlName,
  Validators
} from '@angular/forms';
import { CreatePitchCardService, Step } from '../create-pitch-card.service';
import { forkJoin, Subscription } from 'rxjs';
import { BusinessService } from '../../business/services/business.service';
import { CategoryTag } from '../../business/models/category-tag.model';
import { TagType } from '../../business/enums/tag-type.enum';
import { UiService } from '../../shared/services/ui.service';
import { AppSettings } from '../../shared/app.settings';

@Component({
  selector: 'app-other',
  templateUrl: './other.component.html',
  styleUrls: ['./other.component.scss']
})
export class OtherComponent implements OnInit, OnDestroy {
  $validation: Subscription;
  $businessUpdate: Subscription;
  $formUpdate: Subscription;
  $valueUpdate: Subscription;

  isRefferalActive = false;
  businessType: string;
  form: FormGroup;

  categoryQuery: string;

  tagsSuggestions: CategoryTag[] = [];

  referralForm: FormArray;

  constructor(
    private service: CreatePitchCardService,
    private businessService: BusinessService,
    private changeDetectorRef: ChangeDetectorRef,
    private uiService: UiService
  ) {
  }

  ngOnInit() {
    if (this.service.loaded) {
      this.initializeForm();
    }

    this.$businessUpdate = this.service.$businessUpdated.subscribe(() => {
      this.initializeForm();
    });

    this.businessType = this.service.businessType;
  }

  ngOnDestroy(): void {
    if (this.$validation) {
      this.$validation.unsubscribe();
    }

    if (this.$businessUpdate) {
      this.$businessUpdate.unsubscribe();
    }

    if (this.$valueUpdate) {
      this.$valueUpdate.unsubscribe();
    }
  }

  getPayload() {
    const payload = JSON.parse(JSON.stringify(this.form.value));
    payload.referrals = this.referralForm.value;
    this.sendReferrals();
    return payload;
  }

  initializeForm() {
    this.form = this.service.getBusinessForm();
    this.referralForm = new FormArray([]);
    if (window.matchMedia('(max-width: 767px)').matches) {
      this.addReferral();
    } else {
      this.addReferral();
      this.addReferral();
    }

    this.$formUpdate = this.form.statusChanges.subscribe((valid) => {
      this.service.changeCurrentSectionCompleted(valid == 'VALID');
    });
    this.$valueUpdate = this.form.valueChanges.subscribe((value) => {
      this.service.updateBusiness(value);
    });
  }

  addReferral() {
    this.referralForm.push(
      new FormGroup({
        referName: new FormControl('', [
          Validators.required,
          Validators.minLength(3)
        ]),
        referEmail: new FormControl('', [
          Validators.required,
          Validators.pattern(AppSettings.EMAIL_PATTERN)
        ]),
        referPhone: new FormControl('', [
          Validators.required,
          Validators.minLength(10)
        ])
      })
    );
  }

  addReferralOnClick(event) {
    if (event.detail) {
      this.addReferral();
    }
  }

  sendReferrals() {
    if (this.referralForm.controls.length == 0) {
      return;
    }

    let completedCount = 0;
    let model = [];
    this.referralForm.controls
      .filter((x) => x.valid)
      .forEach((control) => {
        if (
          control.value.referEmail &&
          control.value.referEmail &&
          control.value.referPhone
        ) {
          model.push({
            userName: control.value.referName,
            referralEmail: control.value.referEmail,
            referralPhone: control.value.referPhone,
            businessId: this.service.businessId
          });
        }
      });

    const isDuplicatedEmails = this.isObjectHasDuplicate(
      model,
      'referralEmail'
    );
    const isDuplicatedPhones = this.isObjectHasDuplicate(
      model,
      'referralPhone'
    );
    if (isDuplicatedEmails) {
      this.uiService.errorMessage('Same email used more than once');
      return;
    } else if (isDuplicatedPhones) {
      this.uiService.errorMessage('Same number used more than once');
      return;
    }

    if (model.length) {
      this.businessService.referBusinessBulk(model).subscribe(
        (response) => {
          Object.keys(response.data).forEach((key) => {
            var control = this.referralForm.controls.find(
              (x) => x.value.referEmail == key
            );
            if (response.data[key]) {
              control.setErrors({error: response.data[key]});
            } else {
              this.uiService.successMessage(
                'Invitations successfully sent for ' + key,
                false
              );
              control.reset();
            }
          });
        },
        (err) => {
          this.uiService.errorMessage('Invitations sent was failed');
        }
      );
    } else {
      this.uiService.errorMessage('No valid refferal data to send');
    }
  }

  isObjectHasDuplicate(values, field) {
    const lookup = values.reduce((acc, elem) => {
      acc[elem[field]] = ++acc[elem[field]] || 0;
      return acc;
    }, {});

    return Boolean(
      Object.keys(lookup).filter((key) => lookup[key] > 0).length
    );
  }

  suggestTags(event) {
    this.categoryQuery = event.query;
    this.businessService
      .getTagsSuggestions(
        this.categoryQuery,
        this.form.value.businessTags.map((x) => x.id),
        TagType.CategoryTag,
        null
      )
      .subscribe((result) => {
        this.tagsSuggestions = result.data.records.concat(
          new CategoryTag(
            '',
            0,
            this.capitalizeFirstLetter(this.categoryQuery),
            0
          )
        );
        const removeNewSuggestion = this.tagsSuggestions.some(
          (elem) =>
            elem.name.toLowerCase() === event.query.toLowerCase() &&
            elem.id !== 0
        );
        removeNewSuggestion
          ? this.tagsSuggestions.splice(
            this.tagsSuggestions.length - 1,
            1
          )
          : undefined;
      });
  }

  applyUserTag(event: KeyboardEvent) {
    const targetField = event.target as HTMLInputElement;
    if (event.keyCode == 13 && this.categoryQuery) {
      let newTagsArr = this.form.value.businessTags.concat(
        new CategoryTag(
          '',
          0,
          this.capitalizeFirstLetter(this.categoryQuery),
          0
        )
      );
      this.form.controls.businessTags.setValue(newTagsArr);
      this.changeDetectorRef.detectChanges();
      this.categoryQuery = '';
      targetField.value = '';
    }
  }

  showNotApprovedTagsMessage() {
    if (this.form.controls.businessTags.value.some((tag) => !tag.id)) {
      return true;
    }
    return false;
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
