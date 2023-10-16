import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CreatePitchCardService, Step } from '../create-pitch-card.service';
import { Subscription } from 'rxjs';
import { FormGroup, Validators } from '@angular/forms';
import { CategoryTag } from '../../business/models/category-tag.model';
import { BusinessService } from '../../business/services/business.service';
import { TagType } from '../../business/enums/tag-type.enum';
import { EducationLevel } from '../../business/enums/education-level.enum';
import { AutoComplete } from 'primeng/autocomplete';
import { SearchService } from '../../pitch-card-shared/components/search-result/search.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MultiSelect } from 'primeng/multiselect';
import { Dropdown } from 'primeng/dropdown';

@Component({
  selector: 'app-employment',
  templateUrl: './employment.component.html',
  styleUrls: ['./employment.component.scss']
})
export class EmploymentComponent implements OnInit {
  $validation: Subscription;
  $businessUpdate: Subscription;
  form: FormGroup;
  submitted: boolean = false;
  isAndroidMob: boolean = this.dds.os === 'Android' && this.dds.isMobile();

  positionsSuggestions: CategoryTag[] = [];
  positionsQuery: string;
  checkedPositionSuggestions = [];

  educationalSuggestions: CategoryTag[] = [];
  educationalQuery: string;
  @ViewChild('positions') positions: AutoComplete;
  @ViewChild('colleges') colleges: AutoComplete;
  @ViewChild('workTypesSelect') workTypesSelect: MultiSelect;
  @ViewChild('educations') educations: Dropdown;

  workTypes: any[];

  educationLevelDropdown = this.searchService.educationLevel;

  constructor(
    private service: CreatePitchCardService,
    private changeDetectorRef: ChangeDetectorRef,
    private businessService: BusinessService,
    private dds: DeviceDetectorService,
    private searchService: SearchService
  ) {
  }

  ngOnInit() {
    this.service.currentStep = Step.Employment;
    this.$validation = this.service.$validateSection.subscribe((step) => {
      if (step === Step.Employment && this.form) {
        this.service.changeCurrentSectionCompleted(this.form.valid);
        if (this.form.dirty) {
          this.service
            .updateAndChangeStep(this.getPayload())
            .subscribe(
              (result) => {
              },
              (err) => {
                console.log(err);
              }
            );
        } else {
          this.service.currentStep = this.service.moveToStep;
        }
      }
    });

    if (this.service.loaded) {
      this.initializeForm();
      this.service.changeCurrentSectionVisited();

      this.businessService
        .getTagsSuggestions('', [], TagType.WorkType)
        .subscribe((res) => {
          const idDiff = 1874; // Diff between old ids and new that come from backend. Added for backward compatability;
          this.workTypes = res.data.records;
          this.workTypes.sort((a, b) =>
            a.id > b.id ? 1 : b.id > a.id ? -1 : 0
          );
          if (
            this.form.value.workType &&
            !this.form.value.workTypes?.length
          ) {
            this.form.controls.workTypes.setValue([
              this.workTypes.filter(
                (elem) =>
                  elem.id ===
                  this.form.value.workType + idDiff
              )[0]
            ]);
          }
        });
    }

    this.$businessUpdate = this.service.$businessUpdated.subscribe(() => {
      this.initializeForm();
    });
    this.onEducationChange();
  }

  clickOnPositionItem(event, position?) {
    event.originalEvent?.preventDefault();
    event.originalEvent?.stopPropagation();
    if (position) {
      if (event.checked) {
        this.checkedPositionSuggestions.push(position);
      } else {
        this.checkedPositionSuggestions =
          this.checkedPositionSuggestions.filter(
            (checkedPosition) => checkedPosition.id !== position.id
          );
      }
    } else {
      this.checkedPositionSuggestions.push(event);
    }
    const duplicateCounter = this.checkedPositionSuggestions.reduce(
      (acc, elem) => {
        acc[elem.name] = ++acc[elem.name] || 0;
        return acc;
      },
      {}
    );
    Object.entries(duplicateCounter).forEach(([key, value]) => {
      if (value > 0) {
        this.checkedPositionSuggestions =
          this.checkedPositionSuggestions.filter((elem) => {
            if (elem.name === key) {
              return elem.id !== 0;
            } else {
              return true;
            }
          });
      }
    });
    this.positions.show();
  }

  suggestPositions(event) {
    this.positionsQuery = event.query;
    this.businessService
      .getTagsSuggestions(
        this.positionsQuery,
        this.form.value.positions.map((x) => x.id),
        TagType.Position,
        null
      )
      .subscribe((result) => {
        this.positionsSuggestions = [
          new CategoryTag(
            '',
            0,
            this.service.capitalizeFirstLetter(this.positionsQuery),
            0,
            TagType.Position
          ),
          ...result.data.records
        ];
        const removeNewSuggestion = this.positionsSuggestions.some(
          (elem) =>
            elem.name.toLowerCase() === event.query.toLowerCase() &&
            elem.id !== 0
        );
        removeNewSuggestion
          ? this.positionsSuggestions.splice(
            this.positionsSuggestions.length - 1,
            1
          )
          : undefined;
      });
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

  applyUserTagForPositions(event: KeyboardEvent) {
    let newTagsArr = [];
    if (event && event?.keyCode == 13 && this.positionsQuery) {
      const targetField = event.target as HTMLInputElement;
      if (
        this.form.value.positions.some(
          (elem) =>
            elem.name ===
            targetField.value.charAt(0).toUpperCase() +
            targetField.value.slice(1)
        )
      ) {
        this.positionsQuery = '';
        targetField.value = '';
        return;
      }
      if (
        this.positionsQuery !== targetField.value ||
        this.positionsQuery.length < 3
      ) {
        this.positionsQuery = '';
      }
      if (this.checkedPositionSuggestions.length) {
        newTagsArr = this.checkedPositionSuggestions.reduce(
          (acc, position) => [...acc, position],
          this.form.value.positions
        );
        this.positions.multiInputEL.nativeElement.value = '';
      } else {
        newTagsArr = this.form.value.positions.concat(
          new CategoryTag(
            '',
            0,
            this.service.capitalizeFirstLetter(this.positionsQuery),
            0,
            TagType.Position
          )
        );
        targetField.value = '';
      }
    } else if (!event && this.checkedPositionSuggestions.length) {
      newTagsArr = this.checkedPositionSuggestions.reduce(
        (acc, position) => {
          if (!acc.some((elem) => elem.name === position.name)) {
            return [...acc, position];
          } else {
            return acc;
          }
        },
        this.form.value.positions
      );
      this.positions.multiInputEL.nativeElement.value = '';
    }
    if (newTagsArr?.length) {
      this.form.controls.positions.setValue(newTagsArr);
      this.form.controls.positions.markAsDirty();
      this.changeDetectorRef.detectChanges();
      this.positionsQuery = '';
      this.checkedPositionSuggestions = [];
      this.positions.hide();
    }
    this.service.tileRequiredState = this.form.valid;
  }

  applyCheckedTags() {
    let newTagsArr = this.checkedPositionSuggestions.reduce(
      (acc, position) => [...acc, position],
      this.form.value.positions
    );
    this.form.controls.positions.setValue(newTagsArr);
    this.form.controls.positions.markAsDirty();
    this.changeDetectorRef.detectChanges();
    if (this.checkedPositionSuggestions.length) {
      this.positions.multiInputEL.nativeElement.value = '';
    }
    this.positionsQuery = '';
    this.checkedPositionSuggestions = [];
  }

  suggestEducational(event) {
    console.log(event);
    this.educationalQuery = event.query;
    this.businessService
      .getTagsSuggestions(
        this.educationalQuery,
        this.form.value.educationalInstitutions.map((x) => x.id),
        TagType.EducationalInstitution,
        null
      )
      .subscribe((result) => {
        this.educationalSuggestions = result.data.records.concat(
          new CategoryTag(
            '',
            0,
            this.service.capitalizeFirstLetter(
              this.educationalQuery
            ),
            0,
            TagType.EducationalInstitution
          )
        );
        const removeNewSuggestion = this.educationalSuggestions.some(
          (elem) =>
            elem.name.toLowerCase() === event.query.toLowerCase() &&
            elem.id !== 0
        );
        removeNewSuggestion
          ? this.educationalSuggestions.splice(
            this.educationalSuggestions.length - 1,
            1
          )
          : undefined;
      });
  }

  applyUserTagForEducational(event: KeyboardEvent) {
    const targetField = event.target as HTMLInputElement;
    if (event.keyCode == 13 && this.educationalQuery) {
      if (
        this.educationalQuery !== targetField.value ||
        this.educationalQuery.length < 3
      ) {
        this.educationalQuery = '';
      }
      let newTagsArr = this.form.value.educationalInstitutions.concat(
        new CategoryTag(
          '',
          0,
          this.service.capitalizeFirstLetter(this.educationalQuery),
          0,
          TagType.EducationalInstitution
        )
      );
      this.form.controls.educationalInstitutions.setValue(newTagsArr);
      this.form.controls.educationalInstitutions.markAsDirty();
      this.changeDetectorRef.detectChanges();
      this.educationalQuery = '';
      targetField.value = '';
    }
  }

  getPayload() {
    const payload = {};

    Object.keys(this.form.controls).forEach((key: string) => {
      if (this.form.controls[key].dirty) {
        if (key === 'educationLevel') {
          payload[key] = this.form.value[key].value.id;
        } else {
          payload[key] = this.form.value[key];
        }
      }
    });

    return payload;
  }

  initializeForm() {
    this.form = this.service.getBusinessForm();
    this.form.controls.educationLevel.setValue(
      this.educationLevelDropdown.filter(
        (elem) => elem.value.id === this.form.value.educationLevel
      )[0]
    );
    this.service.tileRequiredState = this.form.valid;
    this.service.tileFormGroup = this.form;
  }

  showNotApprovedPositionsMessage() {
    if (this.form.controls.positions.value.some((position) => !position.id)) {
      return true;
    }
    return false;
  }

  showNotApprovedCollegesMessage() {
    if (
      this.form.controls.educationalInstitutions.value.some(
        (institute) => !institute.id
      )
    ) {
      return true;
    }
    return false;
  }

  onEducationChange() {
    if (!this.form.value.educationLevel) {
      this.form.controls.educationLevel.setValue({
        value: {id: EducationLevel.None, name: 'None'}
      });
    }
    if (this.form.value.educationLevel.value.id < 3) {
      this.form.controls.educationalInstitutions.clearValidators();
      this.form.controls.educationalInstitutions.updateValueAndValidity();
      this.form.controls.educationalInstitutions.disable();
    } else {
      this.form.controls.educationalInstitutions.enable();
      this.form.controls.educationalInstitutions.setValidators([
        Validators.required
      ]);
      this.form.controls.educationalInstitutions.updateValueAndValidity();
    }
    this.service.tileRequiredState = this.form.valid;
  }

  ngOnDestroy(): void {
    if (this.$validation) {
      this.$validation.unsubscribe();
    }
    if (this.$businessUpdate) {
      this.$businessUpdate.unsubscribe();
    }
  }
}
