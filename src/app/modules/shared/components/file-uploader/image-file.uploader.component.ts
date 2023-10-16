import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';
import { AppSettings } from '../../../shared/app.settings';
import { LoaderService } from './../../components/loader/loader.service';

// import { ImageCropperComponent } from '../image-cropper/image-cropper.component';
import { ImageCropperModule, ImageTransform } from 'ngx-image-cropper';
import { ImageCroppedEvent } from '../../models';
import { UserCommonService } from '../../services/user-common.service';
import { UiService } from '../../services/ui.service';
import { AppConstantService } from '../../services/app-constant.service';
import { CommonBindingDataService } from '../../services/common-binding-data.service';
import { ConfirmationService } from 'primeng/api';
import { RestApiService } from '../../services/rest-api.service';

@Component({
  selector: 'app-image-uploader',
  templateUrl: './image-file.uploader.component.html'
})
export class ImageFileUploaderComponent implements OnInit {
  @Input() accept;
  @Input() uploadButtonLabel;
  @Input() maintainAspectRatio = true;
  @Input() imageQuality = 92;
  @Input() resizeToWidth = 250;
  @Input() resizeToHeight = 250;
  @Input() cropperMinHeight = 250;
  @Input() cropperMinWidth = 250;
  @Input() aspectRatio = '4 / 3';
  @Input() dialogWidth = '400px';
  @Input() onlyScaleDown = true;
  @Input() containWithinAspectRatio = false;
  @Output() beforeFileUploadEvent: EventEmitter<any> = new EventEmitter();
  @Output() afterFileUploadEvent: EventEmitter<any> = new EventEmitter();
  @Output() errorInImageCropperUpload: EventEmitter<any> = new EventEmitter();

  maxSize = AppSettings.FILE_UPLOAD_MAX_SIZE_IN_BYTE;

  imageURL: any = '';
  croppedImage: any = '';
  showCropper = false;
  _displayImageCropper: boolean = false;

  public get displayImageCropper(): boolean {
    return this._displayImageCropper;
  }

  public set displayImageCropper(value: boolean) {
    if (!value) {
      this.clearInput();
    }
    this._displayImageCropper = value;
  }

  displayCropBtn: Boolean = false;
  acceptImageextensions = AppConstantService.acceptImageextensions;
  eventTemp;
  transform: ImageTransform = {scale: 1};
  zoomValue = 1;

  @ViewChild(ImageCropperModule, {static: true})
  imageCropper: ImageCropperModule;
  @ViewChild('fileInput', {static: true}) fileInput: ElementRef;

  constructor(
    private loaderService: LoaderService,
    private userCommonService: UserCommonService,
    private uiService: UiService,
    private confirmationService: ConfirmationService,
    private restApiService: RestApiService,
    private appConstantService: AppConstantService,
    private commonBindingService: CommonBindingDataService
  ) {
  }

  ngOnInit() {
  }

  onUpload(event) {
    this.beforeFileUploadEvent.emit(event);
    this.afterFileUploadEvent.emit(event);
    this.loaderService.hide();
  }

  chooseFileDialog() {
    this.fileInput.nativeElement.click();
  }

  async fileChangeEvent(event: any) {
    this.eventTemp = event;
    var extension = this.eventTemp.target.files[0].name.split('.').pop();
    if (
      extension == 'heic' ||
      extension == 'heif' ||
      extension === 'HEIC' ||
      extension === 'HEIF'
    ) {
      const formData = new FormData();
      formData.append(
        'files',
        this.eventTemp.target.files[0],
        'cropped_image'
      );

      this.userCommonService.uploadImageFile(formData).subscribe(
        (result) => {
          this.imageCropperLoad(result[0].fileUrl);
        },
        (error) => {
          this.uiService.errorMessage(error.Message);
        }
      );
    } else {
      this.imageCropperLoad(
        window.URL.createObjectURL(this.eventTemp.target.files[0])
      );
    }
  }

  clearInput() {
    this.fileInput.nativeElement.value = '';
  }

  imageCropperLoad(src) {
    this.imageURL = src;
    this.displayImageCropper = true;
    this.showCropper = true;
    this.displayCropBtn = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  imageLoaded() {
    this.showCropper = true;
  }

  cropperReady() {
  }

  loadImageFailed() {
    this.clearInput();
  }

  zoomImgPreview(event) {
    if (event.deltaY > 0) {
      this.transform = {
        scale: parseFloat((this.transform.scale += 0.08).toFixed(2))
      };
      this.zoomValue = this.transform.scale;
    } else if (event.deltaY < 0 && this.transform.scale > 0.1) {
      this.transform = {
        scale: parseFloat((this.transform.scale -= 0.08).toFixed(2))
      };
      this.zoomValue = this.transform.scale;
    }
  }

  onZoom(event) {
    this.transform = {scale: event.value};
    this.zoomValue = event.value;
  }

  crop() {
    this.displayImageCropper = false;
    this.showCropper = false;
    this.displayCropBtn = false;

    const formData = new FormData();
    if (this.croppedImage) {
      formData.append(
        'files',
        this.base64ToBlob(this.croppedImage),
        'cropped_image'
      );
      this.userCommonService.uploadImageFile(formData).subscribe(
        (result) => {
          this.onUpload(result);
        },
        (error) => {
          this.uiService.errorMessage(error.Message);
        }
      );
    } else {
      this.uiService.errorMessage(
        'Broken file content, please use another file'
      );
    }
  }

  private base64ToBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const bb = new Blob([ab]);
    return bb;
  }
}
