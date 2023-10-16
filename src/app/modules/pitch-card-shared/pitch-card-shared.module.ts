import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultThumbnailComponent } from './components/search-result-thumbnail/search-result-thumbnail.component';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { PhonePipe } from './pipes/phone.pipe';
import { PitchCardService } from './services/pitch-card.service';
import { PitchCardModalsWrapperService } from './services/pitchcard-modals-wrapper.service';
import { PitchCardModalsWrapperComponent } from './components/pitchcard-modals-wrapper/pitchcards-modals-wrapper.component';
import { CarouselModule } from 'primeng/carousel';
import { RatingModule } from 'primeng/rating';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { PhotoGalleriaComponent } from './components/photo-galleria/photo-galleria.component';
import { ShareBusinessComponent } from './components/share-business/share-business.component';
import { VideoJsPlayerComponent } from './components/video-js-player/video-js-player.component';
import { BusinessReviewsComponent } from './components/business-reviews/business-reviews.component';
import { UploadVideoComponent } from './pages/upload-video-steps/upload-video-steps.component';
import { PitchCardFolderThumbnailComponent } from './components/pitchcard-folder-thumbnail/pitchcard-folder-thumbnail.component';
import { SignInCommonComponent } from './pages/sign-in-common/sign-in-common.component';
import { SplitCamelCasePipe } from './pipes/split-camel-case.pipe';
import { RatingStarsComponent } from './components/rating-stars/rating-stars.component';
import { VideoUploadComponent } from './components/video-upload/video-upload.component';
import { SearchResultPageComponent } from './components/search-result-page/search-result-page.component';
import { FileUploadModule } from 'primeng/fileupload';
import { ShareButtonModule } from 'ngx-sharebuttons/button';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { AngularXQRCodeComponent } from './components/angularx-qrcode/angularx-qrcode.component';
import { PasswordModule } from 'primeng/password';
import { ContextMenuModule } from 'primeng/contextmenu';
import { BusinessReviewItemComponent } from './components/business-review-item/business-review-item.component';
import { RatingBoxComponent } from './components/rating-box/rating-box.component';
import { SearchResultComponent } from './components/search-result/search-result.component';
import { SearchFiltersComponent } from './components/search-result/search-filters/search-filters.component';
import { SearchTabsComponent } from './components/search-result/search-tabs/search-tabs.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SearchService } from './components/search-result/search.service';
import { GalleriaModule } from 'primeng/galleria';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RippleModule } from 'primeng/ripple';
import { SignUpCommonComponent } from './pages/sign-up-common/sign-up-common.component';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ContactModalComponent } from '../shared/components/contact-modal/contact-modal.component';
import { EpRestrictComponent } from '../shared/components/ep-restrict/ep-restrict.component';
import { DoneModalComponent } from '../shared/components/done-modal/done-modal.component';
import { VerifyFormComponent } from '../shared/components/varify-input/verify-form.component';
import { NgxVcardModule } from 'ngx-vcard';
import { InputSwitchModule } from 'primeng/inputswitch';
import { WttSwiperComponent } from './components/swiper/swiper.component';
import { IndexOfPipe } from './pipes/index-of.pipe';
import { OtpInputModule } from '../otp-input/otp-input.module';
import { PocketSetupComponent } from './components/pocket-setup/pocket-setup.component';

@NgModule({
  declarations: [
    SearchResultThumbnailComponent,
    PitchCardModalsWrapperComponent,
    PhonePipe,
    PhotoGalleriaComponent,
    ShareBusinessComponent,
    VideoJsPlayerComponent,
    BusinessReviewsComponent,
    UploadVideoComponent,
    PitchCardFolderThumbnailComponent,
    SignInCommonComponent,
    SplitCamelCasePipe,
    RatingStarsComponent,
    VideoUploadComponent,
    SearchResultPageComponent,
    AngularXQRCodeComponent,
    BusinessReviewItemComponent,
    RatingBoxComponent,
    SearchResultComponent,
    SearchFiltersComponent,
    SearchTabsComponent,
    SidebarComponent,
    SignUpCommonComponent,
    ContactModalComponent,
    EpRestrictComponent,
    DoneModalComponent,
    VerifyFormComponent,
    WttSwiperComponent,
    IndexOfPipe,
    PocketSetupComponent
  ],
  exports: [
    SearchResultThumbnailComponent,
    PitchCardModalsWrapperComponent,
    PhotoGalleriaComponent,
    ShareBusinessComponent,
    VideoJsPlayerComponent,
    BusinessReviewsComponent,
    UploadVideoComponent,
    PitchCardFolderThumbnailComponent,
    SignInCommonComponent,
    SplitCamelCasePipe,
    PhonePipe,
    RatingStarsComponent,
    VideoUploadComponent,
    SearchResultPageComponent,
    AngularXQRCodeComponent,
    BusinessReviewItemComponent,
    RatingBoxComponent,
    SearchResultComponent,
    SearchFiltersComponent,
    SearchTabsComponent,
    SwiperModule,
    SidebarComponent,
    ContactModalComponent,
    EpRestrictComponent,
    DoneModalComponent,
    VerifyFormComponent,
    WttSwiperComponent,
    PocketSetupComponent
  ],
  imports: [
    CommonModule,
    TooltipModule,
    TranslateModule,
    DialogModule,
    CarouselModule,
    RatingModule,
    FormsModule,
    ConfirmDialogModule,
    NgxDocViewerModule,
    FileUploadModule,
    ShareButtonModule,
    InputMaskModule,
    InputTextModule,
    ReactiveFormsModule,
    PasswordModule,
    ContextMenuModule,
    AutoCompleteModule,
    SwiperModule,
    OverlayPanelModule,
    GalleriaModule,
    RippleModule,
    CheckboxModule,
    DropdownModule,
    MultiSelectModule,
    NgxVcardModule,
    InputSwitchModule,
    OtpInputModule
  ],
  providers: [
    PitchCardService,
    PitchCardModalsWrapperService,
    SearchService,
    SplitCamelCasePipe,
    IndexOfPipe
  ]
})
export class PitchCardSharedModule {}
