import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  OnInit
} from '@angular/core';
import { MyPocket } from '../../models/my-pocket.model';
import { MyPocketsService } from '../../services/my-pockets.service';

@Component({
    selector: 'app-pocket-thumbnail',
    templateUrl: './pocket-thumbnail.component.html',
    styleUrls: ['./pocket-thumbnail.component.scss']
})
export class PocketThumbnailComponent implements OnInit {
  @Input() scale = 1.0;
  @Input() pocket: any = null;
  @Input() pocketColor: string = '#47B5B7';
  @Input() isNoSelected: boolean = false;
  @Input() defaultPocket: boolean = false;
  @Input() attachMode: boolean = false;

  @Output() selectPocket = new EventEmitter<MyPocket>();

  isOrganizationPocket: boolean = false;
  pocketGradient: string =
    'linear-gradient(180deg, #25AEB4 0%, rgba(37, 174, 180, 0) 215.53%)';

  @HostBinding('style.--scale-factor') get scaleFactor() {
    return this.scale;
  }

  constructor(private pocketService: MyPocketsService) {
  }

  ngOnInit() {
    this.setGradient();
    this.setOrganizationPocket();
    }

    setGradient() {
      const allGradients = this.pocketService.getPocketGradients();
      this.pocketGradient = allGradients.find(
        (g) => g.mainColor === this.pocketColor
      ).gradient;
    }

    setOrganizationPocket() {
        if (this.pocket) {
            this.isOrganizationPocket = !!this.pocket.organizationId;
        }
    }

    onSelectPocket() {
        this.selectPocket.emit(this.pocket);
    }
}
