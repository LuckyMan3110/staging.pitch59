import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  OnInit
} from '@angular/core';
import { MyPitchCardFolder } from '../../../choosen-history/models/my-pitchcard-folder.model';
import { MyPocketsService } from '../../../choosen-history/services/my-pockets.service';

@Component({
  selector: 'app-pitchcard-folder-thumbnail',
  templateUrl: './pitchcard-folder-thumbnail.component.html',
  styleUrls: ['./pitchcard-folder-thumbnail.component.scss']
})
export class PitchCardFolderThumbnailComponent implements OnInit {
  @Input() scaleFactor = 0.5;
  @Input() pitchCardFolder: MyPitchCardFolder;
  isFolderWithContent = false;
  isOrganizationFolder = false;
  @Input() onlyFolder = false;
  @Input() folderLoader: number = null;

  @Output() openFolder = new EventEmitter<number>();
  @Output() addContent = new EventEmitter<number>();

  @HostBinding('style.--scale-factor') get scale() {
    return this.scaleFactor;
  }

  pocketGradient: string =
    'linear-gradient(180deg, #25AEB4 0%, rgba(37, 174, 180, 0) 215.53%)';

  constructor(private pocketService: MyPocketsService) {
  }

  ngOnInit() {
    this.setGradient();
    this.checkFolderContent();
  }

  setGradient() {
    const allGradients = this.pocketService.getPocketGradients();
    if (this.pitchCardFolder?.color) {
      this.pocketGradient = allGradients.find(
        (g) => g.mainColor === '#' + this.pitchCardFolder.color
      ).gradient;
    }
  }

  checkFolderContent() {
    this.isOrganizationFolder = this.pitchCardFolder.organizationId > 0;
    if (this.pitchCardFolder.content) {
      if (Object.keys(this.pitchCardFolder.content).length) {
        this.isFolderWithContent = true;
        return;
      }
      this.isFolderWithContent = false;
    }

    this.isFolderWithContent = false;
  }

  handleOpenFolder() {
    this.openFolder.emit(this.pitchCardFolder.id);
  }

  handleAddContent() {
    this.addContent.emit(this.pitchCardFolder.id);
    }
}
