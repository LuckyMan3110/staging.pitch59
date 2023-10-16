import {
  AfterContentChecked,
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { AppConstantService } from '../../../shared/services/app-constant.service';
import { LoaderService } from '../../../shared/components/loader/loader.service';
import { BusinessService } from '../../../business/services/business.service';
import { CommonBindingDataService } from '../../../shared/services/common-binding-data.service';
import { UserCommonService } from '../../../shared/services/user-common.service';
import { CardPackageService } from '../../../cards-packages/services/card-package.service';
import { UiService } from '../../../shared/services/ui.service';
import { PitchCardType } from '../../../shared/enums/pitch-card-type.enum';
import {
  CreateEmployerPortalService,
  Step
} from '../../../create-employer-portal/create-employer-portal.service';
import { CreatePitchCardService } from '../../../create-pitch-card/create-pitch-card.service';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Galleria } from 'primeng/galleria';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss']
})
export class ImagesComponent
  implements OnInit, AfterViewInit, AfterContentChecked {
  PitchCardType = PitchCardType;
  $validation: Subscription;
  $businessUpdate: Subscription;
  $switchFromImages: Subscription;
  errorMessageForVideoCover = '';
  errorMessageForCropperFile = '';
  errorMessage = '';
  form: FormGroup;

  isCompanyImagesLoaded = false;
  isCoverLandscape = true;
  mobileMode = false;
  isResume: boolean;
  thumbnailHeight = 0;

  imgSrc: any = [];
  uploadedFiles = [];
  uploadedFilesIds = [];
  deletedFiles = [];
  files = [];
  selectedPackage;

  activeIndex = 0;
  rightColumnMargin = 0;
  imagesInGalleryView = 6;

  uploadingFileFormat: string;
  attachmentFormat: string;
  showPdf = false;
  isTablet: boolean = this.deviceService.isTablet();
  isMobile: boolean = this.deviceService.isMobile();
  isDesktop: boolean = this.deviceService.isDesktop();

  acceptFileExtensions = AppConstantService.image_extensions.concat(
    AppConstantService.file_extensions_pdf_doc
  );

  imageLoadingCounter = 0;

  service: CreatePitchCardService | CreateEmployerPortalService;
  isOrganization: boolean;
  documentsForCheck: any[] = [];

  @ViewChild('galleria', {static: true}) galleria: Galleria;
  @ViewChild('thumbImg', {static: false}) thumbImg: ElementRef;
  @ViewChild('leftTitle', {static: false}) leftTitle: ElementRef;
  @ViewChild('leftNotes', {static: false}) leftNotes: ElementRef;
  @ViewChild('galleryContainer', {static: false})
  galleryContainer: ElementRef;
  @ViewChild('uploadBtn', {static: false}) uploadBtn: ElementRef;

  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private appConstantService: AppConstantService,
    private businessService: BusinessService,
    private commonBindingService: CommonBindingDataService,
    private userCommonService: UserCommonService,
    private cardPackageService: CardPackageService,
    private deviceService: DeviceDetectorService,
    private uiService: UiService,
    public createEmployerPortalService: CreateEmployerPortalService,
    public createPitchCardService: CreatePitchCardService
  ) {
    this.onResized = this.onResized.bind(this);
    this.service =
      this.router.url.includes('create') &&
      !this.router.url.includes('createType')
        ? this.createPitchCardService
        : this.createEmployerPortalService;
    this.isOrganization =
      this.service.businessType == PitchCardType.EmployerPortal;
  }

  ngOnInit() {
    window.addEventListener('resize', this.onResized);
    this.onResized();
    this.service.currentStep = Step.Images;
    this.isResume = this.service.businessType == PitchCardType.Resume;

    if (this.service.loaded) {
      this.initializeForm();
      this.service.changeCurrentSectionVisited();
    }

    this.$businessUpdate = this.service.$businessUpdated.subscribe(() => {
      this.initializeForm();
    });

    this.$validation = this.service.$validateSection.subscribe((step) => {
      if (step === Step.Images && this.form) {
        this.service.changeCurrentSectionCompleted(this.form.valid);
        if (this.form.dirty) {
          this.service
            .updateAndChangeStep(this.getPayload())
            .subscribe(
              (result) => {
                if (this.deletedFiles.length > 0) {
                  // TODO: Handled on Backend side
                  // this.businessService.deleteFiles(this.deletedFiles).subscribe();
                }
              },
              (err) => {
              }
            );
        } else {
          this.service.currentStep = this.service.moveToStep;
        }
      }
    });

    this.$switchFromImages = this.service.$switchFromImages.subscribe(
      () => {
        this.service.displayCustom = false;
        this.galleria.element.nativeElement.children[0].children[0].children[0].children[0].children[0].click();
      }
    );
  }

  ngAfterViewInit() {
    document
      .getElementsByTagName('body')[0]
      .append(this.galleria.element.nativeElement);
    this.onResized();
  }

  ngAfterContentChecked() {
    this.onResized();
  }

  onResized() {
    this.mobileMode = false;
    if (this.leftNotes && this.leftTitle) {
      const defaultMargin = 0;
      const leftNotesHeight = this.leftNotes.nativeElement.clientHeight;
      const leftTitleHeight = this.leftTitle.nativeElement.clientHeight;

      this.rightColumnMargin =
        defaultMargin +
        leftNotesHeight +
        (leftTitleHeight > 20 ? leftTitleHeight - 20 : 5);
    }

    if (window.innerWidth < 768) {
      this.mobileMode = true;
    }
    this.resizeGalleryImages();
  }

  resizeGalleryImages() {
    if (this.galleryContainer) {
      const galleryWidth =
        this.galleryContainer.nativeElement.clientWidth;
      const leftSpace = 76;
      const rowsNumber = 2;
      const imageWidth = 100;
      const imagesInTheRow = Math.floor(
        (galleryWidth - leftSpace) / imageWidth
      );

      this.imagesInGalleryView = rowsNumber * imagesInTheRow;
    }
  }

  cropWide(index) {
    if (
      this.thumbImg.nativeElement.children[index].style.height !==
      this.thumbImg.nativeElement.children[0].firstChild.width / 1.33 +
      'px'
    ) {
      this.thumbImg.nativeElement.children[index].style.height =
        this.thumbImg.nativeElement.children[index].firstChild.width /
        1.33 +
        'px';
    }
  }

  handleBrokenImg(img, index) {
    this.uploadedFiles.splice(index, 1);
    const fileId =
      img.thumbnail.split('/')[img.thumbnail.split('/').length - 1];
    if (fileId) {
      const i = this.uploadedFilesIds.findIndex((el) => el === fileId);
      this.uploadedFilesIds.splice(i, 1);
    }
    this.resetImages(this.uploadedFiles);
    this.uiService.errorMessage(
      'Broken file content, please use another file'
    );
  }

  getPayload() {
    const payload = {};

    Object.keys(this.form.controls).forEach((key: string) => {
      if (this.form.controls[key].dirty) {
        payload[key] = this.form.value[key];
      }
    });

    payload['employeePictureFileUrl'] = this.uploadedFiles.map(
      (el) => el.file
    );
    payload['employeePictureThumnailUrl'] = null;
    payload['employeePictureFileIds'] = this.uploadedFilesIds.join(',');
    payload['employeePictureThumnailIds'] = this.uploadedFilesIds.join(',');

    return payload;
  }

  initializeForm() {
    this.form = this.service.getBusinessForm();
    this.selectedPackage = this.cardPackageService.getSelectedPackage();

    if (this.form.value.employeePictureThumnailUrl?.length) {
      this.uploadedFiles = this.form.value.employeePictureThumnailUrl.map(
        (el, i) => {
          return {
            file: this.form.value.employeePictureFileUrl[i],
            thumbnail: el
          };
        }
      );
    } else {
      this.uploadedFiles = [];
    }

    if (this.form.value.employeePictureFileIds) {
      this.uploadedFilesIds =
        this.form.value.employeePictureFileIds.length > 0
          ? this.form.value.employeePictureFileIds.split(',')
          : [];
    }

    let filenameArray;
    if (this.form.value.resumeFileUrl) {
      filenameArray = this.form.value.resumeFileUrl.split('.');
      this.uploadingFileFormat = filenameArray[filenameArray.length - 1];
    }
    this.service.tileRequiredState = this.form.valid;
    this.service.tileFormGroup = this.form;
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResized);
    if (this.$validation) {
      this.$validation.unsubscribe();
    }
    if (this.$switchFromImages) {
      this.$switchFromImages.unsubscribe();
    }
    if (this.$businessUpdate) {
      this.$businessUpdate.unsubscribe();
    }
  }

  errorInImageCropperUpload(event) {
    this.errorMessageForVideoCover = event;
  }

  errorInReUploadVideoUpload(event) {
    this.errorMessage = event;
  }

  clearErrorMessage() {
    this.errorMessageForVideoCover = '';
    this.errorMessage = '';
  }

  onSelect(event: any) {
    this.errorMessageForCropperFile = '';
    if (event.target.files.length === 0) {
      return;
    }

    if (event.target.files[0]) {
      const fileExtension = event.target.files[0].name.substring(
        event.target.files[0].name.lastIndexOf('.')
      );
      const isValidExtension = AppConstantService.image_extensions.find(
        (x) => x.toLowerCase() === fileExtension.toLowerCase()
      );

      if (!isValidExtension) {
        event.target.value = '';
        this.errorMessageForCropperFile =
          this.commonBindingService.getLabel(
            'lbl_please_select_valid_image_format'
          );
        return;
      }
    }

    this.imgSrc = [];
    switch (typeof event) {
      case 'string':
        this.imgSrc = [event];
        break;
      case 'object':
        break;
      default:
    }
  }

  postCoverUpload(response) {
    if (response) {
      this.form.controls.videoCoverImageThumbnailUrl.setValue(
        response[0].thumbnailFileUrl
      );
      this.form.controls.videoCoverImageThumbnailUrl.markAsDirty();
      this.form.controls.videoCoverImageFileId.setValue(
        response[0].fileId
      );
      this.form.controls.videoCoverImageFileId.markAsDirty();
      this.form.controls.videoCoverImageThumbnailId.setValue(
        response[0].thumbnailId
      );
      this.form.controls.videoCoverImageThumbnailId.markAsDirty();
      this.form.markAsDirty();
      this.service.updateDraftBusiness({
        videoCoverImageThumbnailUrl: response[0].thumbnailFileUrl
      });
      this.service.tileRequiredState = this.form.valid;
      this.clearErrorMessage();
    }
  }

  postLogoUpload(response) {
    if (response) {
      if (this.isOrganization) {
        this.form.controls.organizationLogoThumbnailUrl.setValue(
          response[0].thumbnailFileUrl
        );
        this.form.controls.organizationLogoThumbnailUrl.markAsDirty();
        this.form.controls.organizationLogoFilelId.setValue(
          response[0].fileId
        );
        this.form.controls.organizationLogoFilelId.markAsDirty();
        this.form.controls.organizationLogoThumbnailId.setValue(
          response[0].organizationLogoThumbnailId
        );
        this.form.controls.organizationLogoThumbnailId.markAsDirty();
      } else {
        this.form.controls.businessLogoThumbnailUrl.setValue(
          response[0].thumbnailFileUrl
        );
        this.form.controls.businessLogoThumbnailUrl.markAsDirty();
        this.form.controls.businessLogoFilelId.setValue(
          response[0].fileId
        );
        this.form.controls.businessLogoFilelId.markAsDirty();
        this.form.controls.businessLogoThumbnailId.setValue(
          response[0].businessLogoThumbnailId
        );
        this.form.controls.businessLogoThumbnailId.markAsDirty();
      }

      this.form.markAsDirty();
      this.service.updateDraftBusiness(
        this.isOrganization
          ? {
            organizationLogoThumbnailUrl:
            response[0].thumbnailFileUrl
          }
          : {businessLogoThumbnailUrl: response[0].thumbnailFileUrl}
      );
      this.service.tileRequiredState = this.form.valid;
      this.clearErrorMessage();
    }
  }

  deleteImage(type) {
    switch (type) {
      case 'cover':
        this.deletedFiles.push(
          this.form.controls.videoCoverImageFileId.value
        );
        if (
          this.form.value.videoCoverImageFileId !==
          this.form.value.videoCoverImageThumbnailId
        ) {
          this.deletedFiles.push(
            this.form.controls.videoCoverImageThumbnailId.value
          );
        }
        this.form.controls.videoCoverImageThumbnailUrl.setValue('');
        this.form.controls.videoCoverImageThumbnailUrl.markAsDirty();
        this.form.controls.videoCoverImageFileId.setValue('');
        this.form.controls.videoCoverImageFileId.markAsDirty();
        this.form.controls.videoCoverImageThumbnailId.setValue('');
        this.form.controls.videoCoverImageThumbnailId.markAsDirty();
        this.service.updateDraftBusiness({
          videoCoverImageThumbnailUrl: null
        });
        break;
      case 'logo':
        if (this.isOrganization) {
          this.deletedFiles.push(
            this.form.controls.organizationLogoFilelId.value
          );
          if (
            this.form.value.organizationLogoFilelId !==
            this.form.value.organizationLogoThumbnailId
          ) {
            this.deletedFiles.push(
              this.form.controls.organizationLogoThumbnailId.value
            );
          }
          this.form.controls.organizationLogoThumbnailUrl.setValue(
            ''
          );
          this.form.controls.organizationLogoThumbnailUrl.markAsDirty();
          this.form.controls.organizationLogoFilelId.setValue('');
          this.form.controls.organizationLogoFilelId.markAsDirty();
          this.form.controls.organizationLogoThumbnailId.setValue('');
          this.form.controls.organizationLogoThumbnailId.markAsDirty();
          this.service.updateDraftBusiness({
            organizationLogoThumbnailUrl: null
          });
        } else {
          this.deletedFiles.push(
            this.form.controls.businessLogoFilelId.value
          );
          if (
            this.form.value.businessLogoFilelId !==
            this.form.value.businessLogoThumbnailId
          ) {
            this.deletedFiles.push(
              this.form.controls.businessLogoThumbnailId.value
            );
          }
          this.form.controls.businessLogoThumbnailUrl.setValue('');
          this.form.controls.businessLogoThumbnailUrl.markAsDirty();
          this.form.controls.businessLogoFilelId.setValue('');
          this.form.controls.businessLogoFilelId.markAsDirty();
          this.form.controls.businessLogoThumbnailId.setValue('');
          this.form.controls.businessLogoThumbnailId.markAsDirty();
          this.service.updateDraftBusiness({
            businessLogoThumbnailUrl: null
          });
        }
        break;
      default:
        const deletedFile = this.uploadedFilesIds[type];
        this.uploadedFilesIds = this.uploadedFilesIds.filter(
          (id) => id !== deletedFile
        );
        const thumbnailToDelete = null;
        if (this.form.value.employeePictureThumnailIds) {
          const thumbnailToDelete =
            this.form.value.employeePictureThumnailIds
              .split(',')
              .find((elem) =>
                elem.includes(deletedFile.split('.')[0])
              );
        }
        this.deletedFiles.push(deletedFile);
        if (deletedFile !== thumbnailToDelete) {
          this.deletedFiles.push(thumbnailToDelete);
        }
        this.uploadedFiles = [
          ...this.uploadedFiles.filter((file) => {
            return !this.deletedFiles.some((deletedId) =>
              file.file.includes(deletedId)
            );
          })
        ];
        this.resetImages(this.uploadedFiles);
        this.activeIndex = type ? 0 : this.uploadedFiles.length - 1;
        break;
    }

    if (!this.uploadedFilesIds.length && this.service.displayCustom) {
      this.service.displayCustom = false;
    }
  }

  uploadCompanyImage(e) {
    this.files = [];
    const files = e.currentTarget.files;
    this.imageLoadingCounter = e.currentTarget.files.length;
    for (let index = 0; index < files.length; index++) {
      const inputFile = files[index];

      if (!inputFile) {
        return;
      }

      const fileExtension = inputFile.name.substring(
        inputFile.name.lastIndexOf('.')
      );

      if (inputFile?.size >= 10000000) {
        this.uiService.errorMessage(
          this.commonBindingService.getLabel(
            'lbl_file_limit_size_err'
          )
        );
        return;
      }

      const isValidExtension = this.acceptFileExtensions.find(
        (x) => x.toLowerCase() === fileExtension.toLowerCase()
      );

      if (!isValidExtension) {
        this.errorMessage = this.commonBindingService.getLabel(
          'lbl_please_select_valid_image_format'
        );
        return;
      }

      const isDocument =
        AppConstantService.file_extensions_pdf_doc.includes(
          fileExtension
        );

      const fileReader = new FileReader();
      const that = this;
      fileReader.onload = (e1: any) => {
        // check if image rotation and converts it to original position
        that.srcToFile(
          e1.target.result,
          inputFile.name,
          inputFile.type
        ).then((resultFile) => {
          // here we get's file fromm base64 data url.
          const fd = new FormData();
          const defaultHeight = 900;
          if (resultFile) {
            fd.append('files', resultFile);
          } else {
            fd.append('files', inputFile);
          }

          if (!isDocument) {
            this.userCommonService
              .uploadCompanyPhotos(fd, defaultHeight)
              .subscribe((response: any[]) => {
                // concat response with existing files
                this.handleSuccessFileUpload(response);
              });
          } else {
            switch (fileExtension) {
              case '.pdf':
                this.userCommonService
                  .uploadPdfFile(fd)
                  .subscribe(
                    (result) => {
                      this.handleSuccessFileUpload(
                        result
                      );
                      this.documentsForCheck.push(result);
                    },
                    (err) => {
                      this.uiService.errorMessage(
                        err?.message
                          ? err.message
                          : 'This format is not supported!'
                      );
                    }
                  );
                break;
              case '.doc':
                this.userCommonService
                  .uploadDocFile(fd)
                  .subscribe(
                    (result) => {
                      this.handleSuccessFileUpload(
                        result
                      );
                      this.documentsForCheck.push(result);
                    },
                    (err) => {
                      this.uiService.errorMessage(
                        err?.message
                          ? err.message
                          : 'This format is not supported!'
                      );
                    }
                  );
                break;
              case '.docx':
                this.userCommonService
                  .uploadDocxFile(fd)
                  .subscribe(
                    (result) => {
                      this.handleSuccessFileUpload(
                        result
                      );
                      this.documentsForCheck.push(result);
                    },
                    (err) => {
                      this.uiService.errorMessage(
                        err?.message
                          ? err.message
                          : 'This format is not supported!'
                      );
                    }
                  );
                break;
              default:
                this.uiService.errorMessage(
                  'This format is not supported!'
                );
                break;
            }
          }
        });
      };
      fileReader.onerror = (err) => {
        if (err) {
          fileReader.abort();
          console.log(err);
        }
      };
      fileReader.readAsDataURL(inputFile);
    }
  }

  handleSuccessFileUpload(res) {
    if (res?.length) {
      this.uploadedFiles = [
        ...this.uploadedFiles,
        ...res.map((x) => ({
          file: x.fileUrl,
          thumbnail: x.thumbnailFileUrl
        }))
      ];
      this.uploadedFilesIds = [
        ...this.uploadedFilesIds,
        ...res.map((x) => x.fileId)
      ];
      this.resetImages(this.uploadedFiles);
      this.errorMessage = '';
      this.checkIsCompanyImagesLoaded(false);
    }
  }

  srcToFile(src, fileName, mimeType) {
    return fetch(src)
      .then(function (res) {
        return res.arrayBuffer();
      })
      .then(function (buf) {
        return new File([buf], fileName, {type: mimeType});
      })
      .catch((reason) => {
        return reason;
      });
  }

  resetImages(images) {
    this.form.controls.employeePictureThumnailUrl.setValue(images.join());
    this.form.controls.employeePictureThumnailUrl.markAsDirty();
    this.form.controls.employeePictureFileIds.setValue(
      this.uploadedFilesIds
    );
    this.form.controls.employeePictureFileIds.markAsDirty();

    this.service.updateDraftBusiness({
      employeePictureThumnailUrl: images,
      employeePictureFileIds: this.uploadedFilesIds.join(',')
    });

    --this.imageLoadingCounter;

    if (this.imageLoadingCounter > 0) {
      this.loaderService.show('page-center');
    } else {
      this.loaderService.hide();
    }

    this.form.markAsDirty();
  }

  checkIsCompanyImagesLoaded(isCompanyImagesLoaded?) {
    this.isCompanyImagesLoaded = isCompanyImagesLoaded;
  }

  companyImagesLoaded() {
    if (this.uploadedFiles) {
      // setTimeout(() => {
      //   this.checkIsCompanyImagesLoaded(true);
      // }, 1500);
    }
  }

  imageClick(index: number) {
    this.activeIndex = index;
    this.service.displayCustom = true;
    this.updateCloseBtnStyle(true);
    this.startLoader();
    this.setGalleryNavigation(true);
  }

  uploadResume(e: any) {
    const formData = new FormData();
    formData.append('files', e.currentTarget.files[0]);
    if (e.currentTarget.files[0]?.size >= 10000000) {
      this.uiService.errorMessage(
        this.commonBindingService.getLabel('lbl_file_limit_size_err')
      );
      return;
    }
    const filenameArray = e.currentTarget.files[0].name.split('.');
    this.uploadingFileFormat = filenameArray[filenameArray.length - 1];
    switch (this.uploadingFileFormat) {
      case 'pdf':
        this.userCommonService.uploadPdfFile(formData).subscribe(
          (result) => {
            this.form.controls.resumeFileId.setValue(
              result[0].fileId
            );
            this.form.controls.resumeFileId.markAsDirty();
            this.form.controls.resumeFileUrl.setValue(
              result[0].fileUrl
            );
            this.form.controls.resumeFileUrl.markAsDirty();
            this.uploadBtn.nativeElement.value = '';
            this.form.markAsDirty();
            this.service.updateDraftBusiness({
              resumeFileId: result[0].fileId,
              resumeFileUrl: result[0].fileUrl
            });
            this.service.tileRequiredState = this.form.valid;
          },
          (err) => {
            this.uploadBtn.nativeElement.value = '';
            this.uiService.errorMessage(err.Message);
          }
        );
        break;
      case 'doc':
        this.userCommonService.uploadDocFile(formData).subscribe(
          (result) => {
            this.form.controls.resumeFileId.setValue(
              result[0].fileId
            );
            this.form.controls.resumeFileId.markAsDirty();
            this.form.controls.resumeFileUrl.setValue(
              result[0].fileUrl
            );
            this.form.controls.resumeFileUrl.markAsDirty();
            this.uploadBtn.nativeElement.value = '';
            this.form.markAsDirty();
            this.service.updateDraftBusiness({
              resumeFileId: result[0].fileId,
              resumeFileUrl: result[0].fileUrl
            });
            this.service.tileRequiredState = this.form.valid;
          },
          (err) => {
            this.uploadBtn.nativeElement.value = '';
            this.uiService.errorMessage(err.Message);
          }
        );
        break;
      case 'docx':
        this.userCommonService.uploadDocxFile(formData).subscribe(
          (result) => {
            this.form.controls.resumeFileId.setValue(
              result[0].fileId
            );
            this.form.controls.resumeFileId.markAsDirty();
            this.form.controls.resumeFileUrl.setValue(
              result[0].fileUrl
            );
            this.form.controls.resumeFileUrl.markAsDirty();
            this.uploadBtn.nativeElement.value = '';
            this.form.markAsDirty();
            this.service.updateDraftBusiness({
              resumeFileId: result[0].fileId,
              resumeFileUrl: result[0].fileUrl
            });
            this.service.tileRequiredState = this.form.valid;
          },
          (err) => {
            this.uploadBtn.nativeElement.value = '';
            this.uiService.errorMessage(err.Message);
          }
        );
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
        this.userCommonService
          .uploadImageFile(formData, 1080)
          .subscribe(
            (result) => {
              this.form.controls.resumeFileId.setValue(
                result[0].fileId
              );
              this.form.controls.resumeFileId.markAsDirty();
              this.form.controls.resumeFileUrl.setValue(
                result[0].fileUrl
              );
              this.form.controls.resumeFileUrl.markAsDirty();
              this.uploadBtn.nativeElement.value = '';
              this.form.markAsDirty();
              this.service.updateDraftBusiness({
                resumeFileId: result[0].fileId,
                resumeFileUrl: result[0].fileUrl
              });
              this.service.tileRequiredState = this.form.valid;
            },
            (err) => {
              this.uploadBtn.nativeElement.value = '';
              this.uiService.errorMessage(err.Message);
            }
          );
        break;
      default:
        this.uiService.errorMessage('This format is not supported!');
        break;
    }
  }

  showPdfDoc() {
    this.showPdf = !this.showPdf;
  }

  deletePdf() {
    this.deletedFiles.push(this.form.value.resumeFileId);
    this.form.controls.resumeFileUrl.reset();
    this.form.controls.resumeFileId.reset();
    this.form.controls.resumeFileUrl.markAsDirty();
    this.form.controls.resumeFileId.markAsDirty();
    this.uploadBtn.nativeElement.value = null;
    this.form.markAsDirty();
    this.service.updateDraftBusiness({
      resumeFileId: null,
      resumeFileUrl: null
    });
  }

  showViaDocViewer() {
    return this.uploadingFileFormat === 'pdf' ||
    this.uploadingFileFormat === 'doc' ||
    this.uploadingFileFormat === 'docx'
      ? true
      : false;
  }

  getFilePreviewSrc(url: string) {
    if (url?.includes('.doc') || url?.includes('.docx')) {
      return '/assets/images/fa-icons/word-file.svg';
    } else if (url?.includes('.pdf')) {
      return '/assets/images/fa-icons/pdf-file.svg';
    } else {
      return url;
    }
  }

  isDocument(fileUrl) {
    if (fileUrl) {
      return (
        fileUrl.includes('.pdf') ||
        fileUrl.includes('.doc') ||
        fileUrl.includes('.docx')
      );
    } else {
      this.stopLoader();
      return false;
    }
  }

  errorLoad(e) {
    console.log(e);
  }

  updateCloseBtnStyle(isChange?) {
    if (isChange) {
      this.galleria.element.nativeElement.classList.remove('doc-viewer');
    } else {
      this.galleria.element.nativeElement.classList.add('doc-viewer');
    }
  }

  startLoader() {
    this.loaderService.show('page-center');
  }

  stopLoader() {
    this.loaderService.hide();
  }

  setGalleryNavigation(isLoading) {
    if (this.uploadedFiles?.length > 0) {
      this.galleria.showItemNavigators = !isLoading;
    }
  }

  downloadFile(data) {
    if (!this.isDocument(data)) {
      this.businessService.downloadImage(data);
    } else {
      this.businessService.downloadImage(data, 'document');
    }
  }
}
