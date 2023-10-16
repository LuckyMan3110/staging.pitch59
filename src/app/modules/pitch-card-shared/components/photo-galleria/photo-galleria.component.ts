import {
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  ViewEncapsulation,
  ViewChild
} from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Galleria } from 'primeng/galleria';
import { LoaderService } from '../../../shared/components/loader/loader.service';
import { BusinessService } from '../../../business/services/business.service';

@Component({
  selector: 'app-photo-galleria',
  templateUrl: './photo-galleria.component.html',
  styleUrls: ['./photo-galleria.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PhotoGalleriaComponent implements OnInit, OnDestroy {
  isMobile = this.dds.isMobile();
  isDesktop = this.dds.isDesktop();

  @Input() images: string[] | { file: string; thumbnail: string }[] = [];
  @Input() showGalleria: boolean;
  @Input() showThumbnails = true;
  @Output() hideGallery = new EventEmitter<boolean>();

  @ViewChild('galleria', {static: true}) galleria: Galleria;

  @HostListener('window:click', ['$event'])
  handleClick(event: any) {
    const path = event.path || (event.composedPath && event.composedPath());

    if (
      path.find(
        (x) => x?.className && x?.className.includes('p-galleria-close')
      )
    ) {
      this.onGalleriaHide();
    }
  }

  constructor(
    private dds: DeviceDetectorService,
    private loaderService: LoaderService,
    private businessService: BusinessService
  ) {
  }

  ngOnInit() {
    this.setupLoader(true);
    this.setupHeader();
  }

  ngOnDestroy() {
    this.setupLoader(false);
    this.images = [];
  }

  onGalleriaHide() {
    this.setupHeader(true);
    this.hideGallery.emit(false);
  }

  isDocument(fileUrl) {
    if (fileUrl) {
      return (
        fileUrl.includes('.pdf') ||
        fileUrl.includes('.doc') ||
        fileUrl.includes('.docx')
      );
    } else {
      this.setupLoader(false);
      return false;
    }
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

  updateCloseBtnStyle(isChange?) {
    if (isChange) {
      this.galleria.element.nativeElement.classList.remove('doc-viewer');
    } else {
      this.galleria.element.nativeElement.classList.add('doc-viewer');
    }
  }

  setupLoader(isLoading) {
    isLoading
      ? this.loaderService.show('page-center')
      : this.loaderService.hide();
  }

  setupHeader(show = false) {
    if (this.isMobile) {
      const header = document.getElementById('header-container');
      if (!show) {
        header.classList.add('hidden');
      } else {
        header.classList.remove('hidden');
      }
    }
  }

  setGalleryNavigation(isLoading) {
    if (this.images?.length > 0) {
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
