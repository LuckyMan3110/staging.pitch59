import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  PLATFORM_ID,
  SimpleChange
} from '@angular/core';
import { isPlatformServer } from '@angular/common';

declare var QRCode: any;

@Component({
  selector: 'app-angularx-qrcode',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ''
})
export class AngularXQRCodeComponent implements OnChanges, AfterViewInit {
  /** @internal */
  @Input() public allowEmptyString = false;
  @Input() public colordark = '#000000ff';
  @Input() public colorlight = '#ffffff';
  @Input() public level = 'M';
  @Input() public hidetitle = false;
  @Input() public qrdata = '';
  @Input() public size = 256;
  @Input() public usesvg = false;

  public qrcode: any;

  constructor(
    public el: ElementRef,
    @Inject(PLATFORM_ID) private readonly platformId: any
  ) {
  }

  public ngAfterViewInit() {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    QRCode.prototype.makeImage = function () {
      if (typeof this._oDrawing.makeImage === 'function') {
        this._oDrawing.makeImage();
      }
    };
    try {
      if (!this.isValidQrCodeText(this.qrdata)) {
        throw new Error('Empty QR Code data');
      }

      this.qrcode = new QRCode(this.el.nativeElement, {
        colorDark: this.colordark,
        colorLight: this.colorlight,
        correctLevel: QRCode.CorrectLevel[this.level.toString()],
        height: this.size,
        text: this.qrdata || ' ',
        useSVG: this.usesvg,
        width: this.size
      });
    } catch (e) {
      console.error('Error generating QR Code: ' + e.message);
    }
  }

  public ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if (!this.qrcode) {
      return;
    }

    const qrData = changes['qrdata'];

    if (qrData && this.isValidQrCodeText(qrData.currentValue)) {
      this.qrcode.clear();
      this.qrcode.makeCode(qrData.currentValue);
    }
  }

  protected isValidQrCodeText = (data: string): boolean => {
    if (this.allowEmptyString === false) {
      return !(typeof data === 'undefined' || data === '');
    }
    return !(typeof data === 'undefined');
  };
}
