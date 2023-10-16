import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  OnChanges,
  Output,
  ViewChild
} from '@angular/core';
import { Editor } from 'primeng/editor';
import { Dropdown } from 'primeng/dropdown';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { CreatePitchCardService } from '../../../../create-pitch-card/create-pitch-card.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ConfirmationService } from 'primeng/api';

export interface IntroTextOptions {
  extraPhoneNumber: string;
  isEnabledIntroText: boolean;
  introText: string;
  textValue?: string;
  name?: string;
  companyName?: string;
}

@Component({
  selector: 'app-text-introduction',
  templateUrl: './text-introduction.component.html',
  styleUrls: [
    './text-introduction.component.scss',
    '../enter-information.component.scss'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextIntroductionComponent),
      multi: true
    }
  ]
})
export class TextIntroductionComponent implements OnInit, OnChanges, ControlValueAccessor {
  @ViewChild('editor') editor: Editor;
  @ViewChild('constantList') constantList: Dropdown;

  @Input() variables: any[] = [
    {value: 'company', label: 'Company Name'},
    {value: 'name', label: 'Name'}
  ];
  @Input() charLimit;
  @Input() disabled = false;
  @Input() extraContactNumber;

  textOptions: IntroTextOptions = {
    extraPhoneNumber: '',
    isEnabledIntroText: true,
    introText: '',
    textValue: ''
  };

  @Input()
  set isDefaultTemplate(value) {
    this._isDefaultTemplate = value;
  }

  @Output() runReset: EventEmitter<any> = new EventEmitter();
  retain: number;
  isTouched = false;
  isMobile = this.dds.isMobile();
  _isDefaultTemplate: boolean;

  onChange: any = () => {
  };
  onTouched: any = () => {
  };

  constructor(
    private createPCService: CreatePitchCardService,
    private dds: DeviceDetectorService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService
  ) {
  }

  ngOnInit(): void {
  }

  ngOnChanges() {
    if (this.extraContactNumber !== undefined){
      this.textOptions.extraPhoneNumber = this.extraContactNumber;
    }
  }

  setItem(item) {
    if (!this.isTouched) {
      return;
    }
    if (item && this.textOptions.introText) {
      let text = this.createPCService.extractHtmlContent(
        this.textOptions.introText
      );
      text = text.trim();
      let [first, second] = [
        text.slice(0, this.retain),
        text.slice(this.retain)
      ];
      this.variables.map((variable) => {
        first = first.replaceAll(
          variable.label,
          `<strong>${variable.label}</strong>`
        );
        second = second.replaceAll(
          variable.label,
          `<strong>${variable.label}</strong>`
        );
      });
      this.textOptions.introText =
        first + ` <strong>${item.value.label}</strong> ` + second;
      this.onChange(this.textOptions);
    } else if (!this.textOptions.introText) {
      this.textOptions.introText = `<strong>${item.value.label}</strong> `;
      this.onChange(this.textOptions);
    }
  }

  setRetain(e) {
    this.retain = e?.range?.index
      ? e.range.index
      : e?.oldRange?.index
        ? e.oldRange.index
        : 0;
  }

  onTextEditorChange(e) {
    this.isTouched = true;
    if (!e?.textValue?.length && !e?.htmlValue?.length) {
      this.textOptions.introText = '';
    } else {
      // const word = this.getWord(e.textValue, e.delta.ops[0].retain);
      // this.retain = e?.textValue?.length ? e?.textValue?.length : 0;

      // this.textOptions.introText = this.validateOnVariables(e.htmlValue, word, e.delta.ops[0].retain, e.textValue);
      // this.editor.writeValue(this.textOptions.introText);
      this.textOptions.textValue = e.textValue;
      if (this.charLimit) {
        if (e.textValue?.length <= this.charLimit) {
          this.textOptions.introText = e.htmlValue;
          this.setNewFieldClasses('ng-valid', 'ng-invalid');
        } else {
          e.textValue = e.textValue.slice(0, this.charLimit);
          this.textOptions.introText = e.textValue;
          this.setNewFieldClasses('ng-invalid', 'ng-valid');
        }
        this.onChange(this.textOptions);
      } else {
        this.textOptions.introText = e.htmlValue;
        this.onChange(this.textOptions);
      }
    }
  }

  setNewFieldClasses(addClass, removeClass) {
    if (this.editor?.el?.nativeElement) {
      const {nativeElement} = this.editor.el;
      nativeElement.classList.remove(removeClass);
      nativeElement.classList.add(addClass);
    }
  }

  getWord(value, selectionStart) {
    const n = value.substring(selectionStart).match(/^[a-zA-Z0-9-_]+/);
    const p = value.substring(0, selectionStart).match(/[a-zA-Z0-9-_]+$/);
    if (!p && !n) {
      return '';
    }
    return (p || '') + (n || '');
  }

  validateOnVariables(
    htmlString: string,
    lastModified: string,
    deltaRetain?: number,
    textString?: string
  ) {
    this.variables.map((v) => {
      const variable = '<strong>' + v.label + '</strong>';
      const searchValue = '<strong>' + lastModified + '</strong>';
      if (
        !htmlString.includes(variable) &&
        (v.label.includes(lastModified) ||
          lastModified.includes(v.label)) &&
        lastModified !== ''
      ) {
        htmlString = htmlString.replace(searchValue, variable);
      } else if (!htmlString.includes(variable) && lastModified === '') {
        htmlString =
          '<p>' +
          textString.substring(0, deltaRetain) +
          variable +
          textString.substring(deltaRetain) +
          '<p>';
        this.variables.map((i) => {
          if (
            htmlString.includes(i.label) &&
            !htmlString.includes('<strong>' + i.label + '</strong>')
          ) {
            htmlString = htmlString.replace(
              i.label,
              '<strong>' + i.label + '</strong>'
            );
          }
        });
      }
    });
    return htmlString;
  }

  setEmptyTemplate() {
    let template = '';
    this.variables.map((v) => {
      template += `<strong>${v.label}</strong> `;
    });
    return `<p>${template}</p>`;
  }

  resetInit(e) {
    if (e?.currentTarget && !this._isDefaultTemplate) {
      const {firstChild} = e.currentTarget;

      this.confirmationService.confirm({
        header: '',
        message:
          'If you Confirm this action your progress would be lost and the Introduction text will be changed to default.',
        acceptLabel: 'Confirm',
        rejectLabel: 'Reject',
        accept: () => {
          firstChild.classList.add('spin');
          setTimeout(() => {
            firstChild.classList.remove('spin');
          }, 2000);
          this.runReset.emit();
        },
        reject: () => {
          this.confirmationService.close();
        }
      });
    }
  }

  writeValue(obj: IntroTextOptions): void {
    this.textOptions = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
