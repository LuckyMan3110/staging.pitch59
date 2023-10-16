import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppSettings } from '../../app.settings';
import { StorageService } from '../../services/storage.service';
import { LoaderService } from '../loader/loader.service';
import { CommonBindingDataService } from '../../services/common-binding-data.service';
import { AppConstantService } from '../../services/app-constant.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-video-uploader',
  templateUrl: './file.uploader.component.html'
})
export class FileUploaderComponent implements OnInit {
  @Input() accept;
  @Input() uploadButtonLabel;
  @Input() multiple = false;
  @Output() beforeFileUploadEvent: EventEmitter<any> = new EventEmitter();
  @Output() afterFileUploadEvent: EventEmitter<any> = new EventEmitter();
  @Output() errorInCompanyImagesUpload: EventEmitter<any> =
    new EventEmitter();
  maxSize = AppSettings.FILE_UPLOAD_MAX_SIZE_IN_BYTE;
  fileUploadUrl: string = AppSettings.UPLOAD_FILE_URL;
  maxSizeMessage;

  constructor(
    private storageService: StorageService,
    private loaderService: LoaderService,
    private commonService: CommonBindingDataService,
    private messageService: MessageService,
    private appConstantService: AppConstantService
  ) {
  }

  ngOnInit() {
    this.maxSizeMessage = this.commonService.getLabel('file_size_limit');
  }

  onSelect({files}: { files: FileList }) {
    const fileListLength = files.length;
    let fileIdx = 0;
    while (fileIdx < fileListLength) {
      const file = files[fileIdx];
      const fileExtension = file.name.substring(
        file.name.lastIndexOf('.')
      );
      const isValidExtension = AppConstantService.image_extensions.find(
        (x) => x.toLowerCase() === fileExtension.toLowerCase()
      );

      if (!isValidExtension) {
        this.errorInCompanyImagesUpload.emit(
          this.commonService.getLabel(
            'lbl_please_select_valid_image_format'
          )
        );
        return;
      }
      fileIdx++;
    }
    // OR - image/* option - below code will be used.

    // if (event.files[0]) {
    //   const type = event.files[0].type;
    //   if (!type.includes('image/')) {
    //     this.errorInCompanyImagesUpload.emit(this.commonService.getLabel('lbl_please_select_valid_image_format'));
    //     this.loaderService.hide();
    //     return;
    //   }
    // }
  }

  onUpload(event) {
    this.beforeFileUploadEvent.emit(event);
    const xhr = event.xhr;
    const response = JSON.parse(xhr.response);
    this.afterFileUploadEvent.emit(event);
    this.loaderService.hide();
  }

  onBeforeSend(event) {
    const xhr = event.xhr;
    const token = this.storageService.getItemFromCookies(
      AppSettings.TOKEN_KEY
    );
    event.xhr.setRequestHeader(
      AppSettings.HEADER_AUTHORIZATION,
      `Bearer ${token}`
    );
    this.loaderService.show('page-center');
  }

  onUploadError(event: any) {
    if (event.files[0]) {
      const fileExtension = event.files[0].name.substring(
        event.files[0].name.lastIndexOf('.')
      );
      const isValidExtension = AppConstantService.image_extensions.find(
        (x) => x.toLowerCase() === fileExtension.toLowerCase()
      );

      if (!isValidExtension) {
        this.errorInCompanyImagesUpload.emit(
          this.commonService.getLabel(
            'lbl_please_select_valid_image_format'
          )
        );
        this.loaderService.hide();
        return;
      }
    }

    this.errorInCompanyImagesUpload.emit(
      this.commonService.getLabel('lbl_error_in_upload_try_again')
    );
    this.loaderService.hide();
  }
}
