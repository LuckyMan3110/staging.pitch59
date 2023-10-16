import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { CategoryTag } from '../../../business/models/category-tag.model';
import { PitchCardType } from '../../../shared/enums/pitch-card-type.enum';
import { BusinessService } from '../../../business/services/business.service';
import { TagType } from '../../../business/enums/tag-type.enum';
import {
  CreateEmployerPortalService,
  Step
} from '../../../create-employer-portal/create-employer-portal.service';
import { CreatePitchCardService } from '../../../create-pitch-card/create-pitch-card.service';
import { Router } from '@angular/router';
import { BusinessHours } from '../../../shared/components/business-hours-component/business-hours.component';
import { Editor } from 'primeng/editor';
import { MultiSelect } from 'primeng/multiselect';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AutoComplete } from 'primeng/autocomplete';

@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.component.html',
  styleUrls: ['./more-info.component.scss']
})
export class MoreInfoComponent implements OnInit, OnDestroy {
  service: CreatePitchCardService | CreateEmployerPortalService;

  $validation: Subscription;
  $businessUpdate: Subscription;
  pricingForm: FormGroup;
  pitchcardType: PitchCardType;

  categoryQuery: string;
  descriptionPlaceholder: string;
  tagsSuggestions: CategoryTag[] = [];
  checkedTagsSuggestions = [];
  allTagsList: CategoryTag[] = [];
  industrySuggestions: CategoryTag[] = [];

  pitchCardTypes = PitchCardType;
  allTagsCount = 0;
  isSelectTag = false;
  isAndroidMob: boolean = this.dds.os === 'Android' && this.dds.isMobile();

  @ViewChild('editor') editor: Editor;
  @ViewChild('searchTags') searchTagsInput: MultiSelect;
  @ViewChild('tags') tags: AutoComplete;

  constructor(
    private router: Router,
    public createEmployerPortalService: CreateEmployerPortalService,
    public createPitchCardService: CreatePitchCardService,
    private businessService: BusinessService,
    private changeDetectorRef: ChangeDetectorRef,
    private dds: DeviceDetectorService
  ) {
    this.service =
      this.router.url.includes('create') &&
      !this.router.url.includes('createType')
        ? this.createPitchCardService
        : this.createEmployerPortalService;
    this.pitchcardType = this.service.businessType;
  }

  ngOnInit() {
    this.service.currentStep = Step.MoreInfo;
    this.initSubscriptions();

    if (this.service.loaded) {
      this.initializeForm();
      this.service.changeCurrentSectionVisited();
    }

    this.populateDescription();

    this.$businessUpdate = this.service.$businessUpdated.subscribe(() => {
      this.initializeForm();
    });
  }

  ngOnDestroy(): void {
    if (this.$validation) {
      this.$validation.unsubscribe();
    }

    if (this.$businessUpdate) {
      this.$businessUpdate.unsubscribe();
    }
  }

  initSubscriptions() {
    this.$validation = this.service.$validateSection.subscribe((step) => {
      if (step === Step.MoreInfo && this.pricingForm) {
        setTimeout(() => {
          this.service.changeCurrentSectionCompleted(
            this.pricingForm.valid
          );

          if (this.pricingForm.dirty) {
            this.service
              .updateAndChangeStep(this.getPayload())
              .subscribe(
                (result) => {
                  console.log(result);
                },
                (err) => {
                  console.log(err);
                }
              );
          } else {
            this.service.currentStep = this.service.moveToStep;
          }
        }, 300);
      }
    });
  }

  initializeForm() {
    this.pricingForm = this.service.getBusinessForm();
    if (
      this.service.businessType === PitchCardType.Job ||
      this.service.businessType === PitchCardType.EmployerPortal
    ) {
      this.getSuggestIndustries();
    }
    if (this.service.businessType === PitchCardType.Employee) {
      this.getBusinessTags();
    }
    this.service.tileRequiredState = this.pricingForm.valid;
    this.service.tileFormGroup = this.pricingForm;
  }

  updateBusinessHoursForm(value: BusinessHours[]) {
    this.pricingForm.controls.workingHours.setValue(value);
    this.pricingForm.controls.workingHours.markAsDirty();
    this.pricingForm.markAsDirty();
  }

  getPayload() {
    const payload = {};
    if (this.service.businessType !== PitchCardType.Resume
      && this.service.businessType !== PitchCardType.Job
      && this.service.businessType !== PitchCardType.EmployerPortal) {
        if (this.pricingForm.value.workingHours?.length) {
          payload['workingHours'] = this.pricingForm.value.workingHours.every(item => (item.hasOwnProperty('weekDay')))
          ? this.pricingForm.value.workingHours
          : [];
        }
        else{
          payload['workingHours'] = [];
        }
      }
    const socialLinkControls: string[] = ['websiteLink', 'calendarLink', 'facebookLink', 'twitterLink', 'instagramLink', 'linkedinLink', 'pinterestLink'];
    Object.keys(this.pricingForm.controls).forEach((key: string) => {
      if (this.pricingForm.controls[key].dirty) {
        if (key === 'description' && !this.isOrganization()) {
          payload['pricingModel'] = this.pricingForm.value[key];
        } else if (socialLinkControls.includes(key)) {
          if (this.pricingForm.get(key).valid) {
            payload[key] = this.pricingForm.value[key];
          } else {
            this.pricingForm.get(key).patchValue('');
          }
        } else if (key === 'workingHours') {
          payload['workingHours'] = payload['workingHours'];
        } else {
          payload[key] = this.pricingForm.value[key];
        }
      }
    });

    return payload;
  }

  formatSocialIdInput(value, socialNetwork) {
    const splittedAddress = value.split('/');
    if (!splittedAddress[0]) {
      this.pricingForm.controls[`${socialNetwork}Link`].setValue('');
    } else if (
      splittedAddress[0] &&
      socialNetwork !== 'calendar' &&
      socialNetwork !== 'website'
    ) {
      const socialPrefix =
        socialNetwork === 'linkedin'
          ? `https://${socialNetwork}.com/in/`
          : `https://${socialNetwork}.com/`;
      if (splittedAddress[splittedAddress.length - 1]) {
        this.pricingForm.controls[`${socialNetwork}Link`].setValue(
          `${socialPrefix}${
            splittedAddress[splittedAddress.length - 1]
          }`
        );
      } else {
        this.pricingForm.controls[`${socialNetwork}Link`].setValue(
          `${socialPrefix}${
            splittedAddress[splittedAddress.length - 2]
          }`
        );
      }
    } else if (
      socialNetwork === 'calendar' ||
      socialNetwork === 'website'
    ) {
      if (
        value.includes('http') ||
        !this.pricingForm.controls[`${socialNetwork}Link`].valid
      ) {
        this.pricingForm.controls[`${socialNetwork}Link`].setValue(
          value
        );
      } else {
        this.pricingForm.controls[`${socialNetwork}Link`].setValue(
          `https://${value}`
        );
      }
    } else {
      this.pricingForm.controls[`${socialNetwork}Link`].setValue(
        `https://${socialNetwork}.com/`
      );
    }
    this.pricingForm.controls[`${socialNetwork}Link`].markAsDirty();
  }

  clearIfInvalid(socialNetwork) {
    if (!this.pricingForm.controls[`${socialNetwork}Link`].valid) {
      this.pricingForm.controls[`${socialNetwork}Link`].setValue('');
      this.pricingForm.controls[`${socialNetwork}Link`].markAsDirty();
    }
  }

  suggestTags(event) {
    this.categoryQuery = event.query;
    this.businessService
      .getTagsSuggestions(
        this.categoryQuery,
        this.pricingForm.value.businessTags.map((x) => x.id),
        TagType.CategoryTag,
        null
      )
      .subscribe((result) => {
        this.tagsSuggestions = result.data.records.concat(
          new CategoryTag(
            '',
            0,
            this.capitalizeFirstLetter(this.categoryQuery),
            0,
            TagType.CategoryTag
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

  clickOnTagItem(event, tag?) {
    event.originalEvent?.preventDefault();
    event.originalEvent?.stopPropagation();
    if (tag) {
      if (event.checked) {
        this.checkedTagsSuggestions.push(tag);
      } else {
        this.checkedTagsSuggestions =
          this.checkedTagsSuggestions.filter(
            (checkedTag) => checkedTag.id !== tag.id
          );
      }
    } else {
      this.checkedTagsSuggestions.push(event);
    }
    const duplicateCounter = this.checkedTagsSuggestions.reduce(
      (acc, elem) => {
        acc[elem.name] = ++acc[elem.name] || 0;
        return acc;
      },
      {}
    );
    Object.entries(duplicateCounter).forEach(([key, value]) => {
      if (value > 0) {
        this.checkedTagsSuggestions =
          this.checkedTagsSuggestions.filter((elem) => {
            if (elem.name === key) {
              return elem.id !== 0;
            } else {
              return true;
            }
          });
      }
    });
    this.tags.show();
  }

  applyUserTag(event: KeyboardEvent) {
    let newTagsArr = [];
    if (event && event?.keyCode == 13 && this.categoryQuery) {
      const targetField = event.target as HTMLInputElement;
      if (
        this.pricingForm.value.businessTags.some(
          (elem) =>
            elem.name ===
            targetField.value.charAt(0).toUpperCase() +
            targetField.value.slice(1)
        )
      ) {
        this.categoryQuery = '';
        targetField.value = '';
        return;
      }
      if (
        this.categoryQuery !== targetField.value ||
        this.categoryQuery.length < 3
      ) {
        this.categoryQuery = '';
      }
      if (this.checkedTagsSuggestions.length) {
        newTagsArr = this.checkedTagsSuggestions.reduce(
          (acc, tag) => [...acc, tag],
          this.pricingForm.value.businessTags
        );
        this.tags.multiInputEL.nativeElement.value = '';
      } else {
        newTagsArr = this.pricingForm.value.businessTags.concat(
          new CategoryTag(
            '',
            0,
            this.service.capitalizeFirstLetter(this.categoryQuery),
            0,
            TagType.Position
          )
        );
        targetField.value = '';
      }
    } else if (!event && this.checkedTagsSuggestions.length) {
      newTagsArr = this.checkedTagsSuggestions.reduce((acc, tag) => {
        if (!acc.some((elem) => elem.name === tag.name)) {
          return [...acc, tag];
        } else {
          return acc;
        }
      }, this.pricingForm.value.businessTags);
      this.tags.multiInputEL.nativeElement.value = '';
    }
    if (newTagsArr?.length) {
      this.pricingForm.controls.businessTags.setValue(newTagsArr);
      this.pricingForm.controls.businessTags.markAsDirty();
      this.changeDetectorRef.detectChanges();
      this.categoryQuery = '';
      this.checkedTagsSuggestions = [];
      this.tags.hide();
    }
    this.service.tileRequiredState = this.pricingForm.valid;
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  showNotApprovedTagsMessage(control) {
    return !!this.pricingForm.get(control).value.some((tag) => !tag.id);
  }

  getSuggestIndustries() {
    this.businessService
      .getTagsSuggestions('', [], TagType.Industry)
      .subscribe((res) => {
        const idDiff = 1874;
        this.industrySuggestions = res.data.records;
        // this.industrySuggestions.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
        if (
          this.pricingForm.value.industries?.length &&
          this.industrySuggestions?.length
        ) {
          const selectedIndustries =
            this.businessService.getSelectedItemsById(
              this.industrySuggestions,
              this.pricingForm.value.industries
            );
          this.pricingForm.controls.industries.setValue(
            selectedIndustries
          );
        }
      });
  }

  getBusinessTags() {
    this.businessService
      .getTagsSuggestions('', [], TagType.CategoryTag)
      .subscribe((res) => {
        const idDiff = 1874;
        this.tagsSuggestions = res.data.records;
        this.tagsSuggestions.sort((a, b) =>
          a.id > b.id ? 1 : b.id > a.id ? -1 : 0
        );
        if (
          this.pricingForm.value.businessTags?.length &&
          this.tagsSuggestions?.length
        ) {
          const selectedIndustries =
            this.businessService.getSelectedItemsById(
              this.tagsSuggestions,
              this.pricingForm.value.businessTags
            );
          this.pricingForm.controls.businessTags.setValue(
            selectedIndustries
          );
        }
      });
  }

  updateFieldOnBlur(field) {
    this.service.updateDraftBusiness({
      [field]: this.pricingForm.value[field]
    });
  }

  isOrganization() {
    return this.service.businessType === 'employerPortal';
  }

  populateDescription() {
    if (this.service.businessType === PitchCardType.Employee) {
      this.descriptionPlaceholder =
        'Tell us a little about your position in your company as well as your hobbies and other things that make you unique.';
    } else if (this.service.businessType === PitchCardType.Service) {
      this.descriptionPlaceholder =
        'Tell us about your mission, who you serve, how to help, etc…';
    } else if (this.service.businessType === PitchCardType.Resume) {
      this.descriptionPlaceholder =
        'Tell us about your hobbies, interests, skills, or things that make you unique...';
    } else {
      this.descriptionPlaceholder =
        'Tell us about your pricing, staff, credentials, etc...';
    }
  }

  updateFieldOnType(e) {
    if (!e?.textValue?.length && !e?.htmlValue?.length) {
      this.pricingForm.get('description').patchValue('');
    }

    setTimeout(() => {
      this.service.updateDraftBusiness({
        ['pricingModel']: [this.pricingForm.get('description').value]
      });
    }, 500);
  }

  moveInputToTop(e) {
    if (this.isAndroidMob) {
      const y = e.target.offsetParent.offsetTop - e.target.offsetTop;
      if (y) {
        window.scrollTo({top: y, behavior: 'smooth'});
      }
    }
  }

  updateHeight(el) {
    if (el?.itemsWrapper) {
      el.itemsWrapper.classList.add('top-100');
    }
    if (el?.overlay) {
      el.overlay.classList.add('top-100');
    }
  }
}
