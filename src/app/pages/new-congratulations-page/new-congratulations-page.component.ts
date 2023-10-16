import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserCommonService } from '../../modules/shared/services/user-common.service';
import { UiService } from '../../modules/shared/services/ui.service';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreatePitchCardService } from '../../modules/create-pitch-card/create-pitch-card.service';
import { PixelService } from 'ngx-pixel';
import { AppSettings } from '../../modules/shared/app.settings';

@Component({
  selector: 'app-new-congratulations-page',
  templateUrl: './new-congratulations-page.component.html',
  styleUrls: ['./new-congratulations-page.component.scss']
})
export class NewCongratulationsPageComponent implements OnInit {
  steps: any[] = [];
  form: FormGroup;

  @Input() isModal: boolean = false;
  @Output() closeModal: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private userCommonService: UserCommonService,
    private uiService: UiService,
    private deviseService: DeviceDetectorService,
    private router: Router,
    private fb: FormBuilder,
    private createPitchCardService: CreatePitchCardService,
    private pixel: PixelService
  ) {
    this.pixel.track('PageView', {
      content_name: 'Congrats, new Pitchcard finished'
    });
  }

  ngOnInit(): void {
    this.stepsInit();
    this.createForm();
  }

  stepsInit() {
    this.steps = [
      {
        title: 'Open the Pitch59 app.',
        description: '',
        imgSrc: '../../assets/images/welcome/instructions/step-one-phone.png',
        link: ''
      },
      {
        title: 'Log in with your Pitch59 account.',
        description: '',
        imgSrc: '../../assets/images/welcome/instructions/step-two-phone.png',
        link: ''
      },
      {
        title: 'Your PitchCard will be waiting on your Home screen!',
        description: 'Need help?',
        imgSrc: '../../assets/images/welcome/instructions/step-three-phone.png',
        link: {path: AppSettings.helpCenterLink, title: 'Contact us'}
      }
    ];
  }

  createForm() {
    this.form = this.fb.group({
      phoneNumber: [null, [Validators.required]]
    });
  }

  sendMessage() {
    if (this.form.value.phoneNumber && this.form.valid) {
      this.userCommonService
        .sendApplicationDownloadInvite(this.form.value.phoneNumber)
        .subscribe(
          () => {
            this.uiService.successMessage(
              'Invite successfully sent'
            );
            if (this.isModal) {
              this.closeModal.emit(true);
            }
          },
          (error) => {
            const message = 'Sorry, something went wrong';
            this.uiService.errorMessage(
              error.Message ? error.Message : message,
              'main',
              3000
            );
          }
        );
    }
  }

  formatPhoneNumber(str) {
    this.form
      .get('phoneNumber')
      .patchValue(this.createPitchCardService.formatPhoneNumber(str));
  }

  navigateTo(link) {
    this.router.navigate([link]);
  }

  isMobile(): boolean {
    return this.deviseService.isMobile();
  }
}
