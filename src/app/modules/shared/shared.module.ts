import { CommonModule, TitleCasePipe } from '@angular/common';
import { ShareButtonModule } from 'ngx-sharebuttons/button';
import { RouterModule } from '@angular/router';
import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  MissingTranslationHandler,
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { MenuModule } from 'primeng/menu';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog'; // used in 'bank-details', 'choosen-history-page'
import { RatingModule } from 'primeng/rating'; // used in 'choosen-history-page'
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ImageCropperModule } from 'ngx-image-cropper';
import { SliderModule } from 'primeng/slider';
import { CaptchaModule } from 'primeng/captcha';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { UiService } from './services/ui.service';
import { RestApiService } from './services/rest-api.service';
import { UserCommonService } from './services/user-common.service';
import { StorageService } from './services/storage.service';
import { CommonMessageTransferService } from './services/common-message-transfer.service';
import { CommonBindingDataService } from './services/common-binding-data.service';
import { SidebarService } from './services/sidebar.service';
import { AuthenticationValidationService } from './services/authentication-validation.service';
import { MiTranslateLoaderService } from './services/mi-translate-loader.service';
import { MiMissingTranslationHandlerService } from './services/mi-missing-translation-handler.service';
import { LoaderService } from './components/loader/loader.service';
import { LoaderComponent } from './components/loader/loader.component';
import { FileUploaderComponent } from './components/file-uploader/file.uploader.component';
import { SidebarModule } from 'primeng/sidebar';
import { SearchLocationDirective } from './directives/search-location.directive';
import { DisableControlDirective } from './directives/input-disabled.directive';
import { FooterComponent } from './components/footer/footer.component';
import { ToastModule } from 'primeng/toast';
import { TwoStepVerificationComponent } from '../../pages/two-step-verification/two-step-verification.component';
import { ChangePasswordComponent } from '../../pages/change-password/change-password.component';
import { ImageCropperComponent } from './components/image-cropper/image-cropper.component';
import { ImageFileUploaderComponent } from './components/file-uploader/image-file.uploader.component';
import { WhiteSpaceDirective } from './directives/white-space.directive';
import { InputMaskModule } from 'primeng/inputmask';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StepsModule } from 'primeng/steps';
import { SeoService } from './services/seo-service';
import { AccordionModule } from 'primeng/accordion';
import { PaginatorModule } from 'primeng/paginator'; // used in 'choosen-history-page'
import { ProgressBarModule } from 'primeng/progressbar';
import { PocketThumbnailComponent } from '../choosen-history/components/pocket-thumbnail/pocket-thumbnail.component';
import { UserBankService } from '../bank-details/services/bank.service';
import { WelcomePageHeaderComponent } from './components/welcome-page-header/welcome-page-header.component';
import { ProgressBarComponent } from '../create-pitch-card/layout/progress-bar/progress-bar.component';
import { VideoReviewItemComponent } from './components/video-review-item/video-review-item.component';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons/faFacebookF';
import { faTwitter } from '@fortawesome/free-brands-svg-icons/faTwitter';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons/faLinkedinIn';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope';
import { faLink } from '@fortawesome/free-solid-svg-icons/faLink';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { MuxVideoComponent } from './components/mux-video/mux-video.component';
import { InViewportModule } from 'ng-in-viewport';
import { CreditCardComponent } from './components/credit-card/credit-card.component';
import { BusinessHoursComponent } from './components/business-hours-component/business-hours.component';
import { TimePickerComponent } from './components/time-picker-component/time-picker.component';
import { TooltipModule } from 'primeng/tooltip';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { GalleriaModule } from 'primeng/galleria';
import { GroupItemComponent } from '../choosen-history/pages/groups/group-item/group-item.component';
import { CarouselModule } from 'primeng/carousel';
import { MuxVideoService } from './services/mux-video.service';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MyProfileService } from './components/my-profile/my-profile.service';
import { DragulaModule } from 'ng2-dragula';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { CountdownModule } from 'ngx-countdown';
import { BankAccountThumbnailComponent } from './bank-account-thumbnail/bank-account-thumbnail.component';
import { BusinessService } from '../business/services/business.service';
import { BusinessBankService } from './services/business-bank.service';
import { AssignUsersComponent } from './components/assign-users/assign-users.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PaymentMethodFormsComponent } from './components/teams-payment-method-forms/payment-method-forms.component';
import { VideoRecorderComponent } from './components/video-recorder/video-recorder.component';
import { NewCongratulationsPageComponent } from '../../pages/new-congratulations-page/new-congratulations-page.component';
import { ShareButtonsConfig, SharerMethod } from 'ngx-sharebuttons';
import { CamelcasePipe } from './pipes/camelcase.pipe';
import { ChoosePitchcardComponent } from './components/employment-components/choose-pitchcard/choose-pitchcard.component';
import { CreateTeamPitchcardComponent } from './components/employment-components/create-team-pitchcard/create-team-pitchcard.component';
import { BackToTheTopButtonComponent } from './components/back-to-the-top-button/back-to-the-top-button.component';
import { AnalyticReportsComponent } from './components/analytic-reports/analytic-reports.component';
import { ComingSoonBannerComponent } from './components/coming-soon-banner/coming-soon-banner.component';
import { PaymentApproveContentComponent } from './components/payment-approve-content/payment-approve-content.component';
import { PitchCardSharedModule } from '../pitch-card-shared/pitch-card-shared.module';
import { CardPackageService } from '../cards-packages/services/card-package.service';
import { WelcomePageService } from '../../pages/welcome-page/welcome-page.service';
import { EmployerPortalService } from '../choosen-history/services/employer-portal.service';
import { NewBillingService } from '../new-billing/services/new-billing.service';
import { AppConstantService } from './services/app-constant.service';
import { CreatePitchCardService } from '../create-pitch-card/create-pitch-card.service';
import { MyPocketsService } from '../choosen-history/services/my-pockets.service';
import { GroupsService } from '../choosen-history/services/groups.service';
import { CreateEmployerPortalService } from '../create-employer-portal/create-employer-portal.service';
import { MyPitchCardsService } from '../choosen-history/services/my-pitch-cards.service';
import { SelectPitchcardsComponent } from './components/select-pitchcards/select-pitchcards.component';
import { SelectPitchCardsService } from './components/select-pitchcards/select-pitch-cards.service';

const shareButtonsConfig: ShareButtonsConfig = {
  sharerMethod: SharerMethod.Window
};

@NgModule({
  imports: [
    CaptchaModule,
    StepsModule,
    CommonModule,
    RouterModule,
    RatingModule,
    InputTextareaModule,
    ConfirmDialogModule,
    CalendarModule,
    ChartModule,
    MenuModule,
    SidebarModule,
    InputTextModule,
    InputSwitchModule,
    PasswordModule,
    DropdownModule,
    RadioButtonModule,
    CheckboxModule,
    DialogModule,
    FormsModule,
    FileUploadModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    OverlayPanelModule,
    SliderModule,
    TableModule,
    ToastModule,
    InputMaskModule,
    ShareButtonModule.withConfig(shareButtonsConfig),
    ImageCropperModule,
    ProgressSpinnerModule,
    AccordionModule,
    PaginatorModule,
    MultiSelectModule,
    InputNumberModule,
    ProgressBarModule,
    InViewportModule,
    TooltipModule,
    CarouselModule,
    GalleriaModule,
    ContextMenuModule,
    CountdownModule,
    DragulaModule.forRoot(),
    NgxDocViewerModule,
    PitchCardSharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: MiTranslateLoaderService
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MiMissingTranslationHandlerService
      }
    })
  ],
  declarations: [
    FooterComponent,
    DisableControlDirective,
    SearchLocationDirective,
    WhiteSpaceDirective,
    LoaderComponent,
    FileUploaderComponent,
    ImageFileUploaderComponent,
    FooterComponent,
    TwoStepVerificationComponent,
    ChangePasswordComponent,
    ImageCropperComponent,
    PocketThumbnailComponent,
    WelcomePageHeaderComponent,
    ProgressBarComponent,
    VideoReviewItemComponent,
    MuxVideoComponent,
    CreditCardComponent,
    BusinessHoursComponent,
    TimePickerComponent,
    ContextMenuComponent,
    GroupItemComponent,
    BankAccountThumbnailComponent,
    AssignUsersComponent,
    PaymentMethodFormsComponent,
    VideoRecorderComponent,
    NewCongratulationsPageComponent,
    CamelcasePipe,
    ChoosePitchcardComponent,
    CreateTeamPitchcardComponent,
    BackToTheTopButtonComponent,
    AnalyticReportsComponent,
    ComingSoonBannerComponent,
    PaymentApproveContentComponent,
    SelectPitchcardsComponent
  ],
  exports: [
    ProgressBarModule,
    CaptchaModule,
    StepsModule,
    CalendarModule,
    ChangePasswordComponent,
    TwoStepVerificationComponent,
    FooterComponent,
    CheckboxModule,
    ChartModule,
    SidebarModule,
    TranslateModule,
    RadioButtonModule,
    ConfirmDialogModule,
    DialogModule,
    SearchLocationDirective,
    DisableControlDirective,
    WhiteSpaceDirective,
    LoaderComponent,
    FileUploaderComponent,
    ImageFileUploaderComponent,
    DropdownModule,
    ToastModule,
    ImageCropperComponent,
    AutoCompleteModule,
    InputMaskModule,
    ShareButtonModule,
    ProgressSpinnerModule,
    TableModule,
    AccordionModule,
    PaginatorModule,
    RatingModule,
    InputTextareaModule,
    InputTextModule,
    InputSwitchModule,
    PasswordModule,
    PocketThumbnailComponent,
    WelcomePageHeaderComponent,
    FormsModule,
    ReactiveFormsModule,
    ProgressBarComponent,
    VideoReviewItemComponent,
    MultiSelectModule,
    InputNumberModule,
    FileUploadModule,
    MuxVideoComponent,
    ImageCropperModule,
    SliderModule,
    InViewportModule,
    CreditCardComponent,
    BusinessHoursComponent,
    TimePickerComponent,
    TooltipModule,
    CarouselModule,
    GalleriaModule,
    ContextMenuModule,
    ContextMenuComponent,
    GroupItemComponent,
    BankAccountThumbnailComponent,
    OverlayPanelModule,
    DragulaModule,
    NgxDocViewerModule,
    AssignUsersComponent,
    PaymentMethodFormsComponent,
    VideoRecorderComponent,
    CountdownModule,
    NewCongratulationsPageComponent,
    ChoosePitchcardComponent,
    CreateTeamPitchcardComponent,
    BackToTheTopButtonComponent,
    AnalyticReportsComponent,
    ComingSoonBannerComponent,
    PaymentApproveContentComponent,
    PitchCardSharedModule,
    SelectPitchcardsComponent,
    CamelcasePipe
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        LoaderService,
        RestApiService,
        CardPackageService,
        UiService,
        UserCommonService,
        StorageService,
        CommonMessageTransferService,
        CommonBindingDataService,
        SearchLocationDirective,
        DisableControlDirective,
        WhiteSpaceDirective,
        AuthenticationValidationService,
        ConfirmationService,
        TranslateService,
        SidebarService,
        SeoService,
        UserBankService,
        BusinessBankService,
        BusinessService,
        MuxVideoService,
        MyProfileService,
        TitleCasePipe,
        WelcomePageService,
        EmployerPortalService,
        NewBillingService,
        AppConstantService,
        CreatePitchCardService,
        MyPocketsService,
        GroupsService,
        CreateEmployerPortalService,
        MyPitchCardsService,
        SelectPitchCardsService
      ]
    };
  }

  constructor(translate: TranslateService, library: FaIconLibrary) {
    library.addIcons(faFacebookF);
    library.addIcons(faTwitter);
    library.addIcons(faLinkedinIn);
    library.addIcons(faEnvelope);
    library.addIcons(faLink);
    library.addIcons(faCheck);
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('en');
  }
}
