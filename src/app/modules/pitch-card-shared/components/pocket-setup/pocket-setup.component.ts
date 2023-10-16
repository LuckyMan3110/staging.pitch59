import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { MyPocketsService } from '../../../choosen-history/services/my-pockets.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-pocket-setup',
  templateUrl: './pocket-setup.component.html',
  styleUrls: ['./pocket-setup.component.scss']
})
export class PocketSetupComponent implements OnInit, AfterViewInit {
  @Input() detailPocketMode: string;
  @Input() pocket: { name: string; color: string } | null;
  @Input() modalErrors: { newPocketName: string; newPocketColor: string };
  @Output() saveChanges: EventEmitter<{ name: string; color: number }> =
    new EventEmitter();
  @ViewChild('newPocketNameInput') newPocketNameInput: ElementRef;

  newPocketName: string | null = null;
  newPocketColor: string | null = null;
  myPocketsColors: string[] = this.myPocketsService.getMyPocketsColor();

  constructor(
    private myPocketsService: MyPocketsService,
    private dds: DeviceDetectorService
  ) {
  }

  ngOnInit(): void {
    this.newPocketName = this.pocket?.name ? this.pocket.name : null;
    this.newPocketColor = this.pocket?.color ? this.pocket.color : null;
  }

  ngAfterViewInit() {
    if (this.newPocketNameInput?.nativeElement) {
      setTimeout(() => {
        this.newPocketNameInput.nativeElement.focus();
      }, 500);
    }
  }

  selectNewPocketColor(color: string | null) {
    this.newPocketColor = color;
    this.modalErrors.newPocketColor = null;
  }

  newPocketSubmit() {
    const validate = this.detailsModalValidate();

    if (validate === 'valid') {
      const params = {
        name: this.newPocketName,
        color: this.myPocketsColors.indexOf(this.newPocketColor)
      };

      this.saveChanges.emit(params);
    }
  }

  detailsModalValidate() {
    let nameMessage: string = null;
    let colorMessage: string = null;
    const errors = {
      newPocketName: null,
      newPocketColor: null
    };

    if (!this.newPocketName) {
      nameMessage = 'The name field is required';
    }

    if (this.newPocketName && this.newPocketName.length > 35) {
      nameMessage = 'Max number of characters is 35';
    }

    colorMessage = !this.newPocketColor
      ? 'The color field is required'
      : null;
    errors.newPocketName = nameMessage;
    errors.newPocketColor = colorMessage;
    this.modalErrors = {...errors};

    return nameMessage || colorMessage ? 'invalid' : 'valid';
  }
}
