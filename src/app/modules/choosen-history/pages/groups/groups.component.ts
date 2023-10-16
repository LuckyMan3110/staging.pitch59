import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { GroupsService } from '../../services/groups.service';
import { LoaderService } from '../../../shared/components/loader/loader.service';

import { UserGroup } from '../../models/user-group.model';
import { UserRolesEnum } from '../../../shared/enums/user-roles.enum';
import { LoaderState } from '../../../shared/components/loader/loader';
import { MyPocketsService } from '../../services/my-pockets.service';

@Component({
    selector: 'app-account-groups',
    templateUrl: './groups.component.html',
    styleUrls: ['./groups.component.scss'],
    providers: [GroupsService, MyPocketsService]
})
export class GroupsComponent implements OnInit, OnDestroy {
    //Global Page Variables
    subscription: Subscription;
    tableLoaded: boolean = false;
    appLoader: boolean = false;
    showModalsLoader: boolean = false;
    userGroups: UserGroup[] = [];
    myGroupColors: string[];
    userRoles = UserRolesEnum;

    //New Group Modal Variables
    detailsGroupModal: boolean = false;
    detailsGroupMode: string = null;
    newGroupColor: string = null;
    newGroupName: string = null;
    editingGroupId: string | number = null;
    modalErrors: { newGroupName: string; newGroupColor: string } = {
      newGroupName: null,
      newGroupColor: null
    };

    //Remove Group Modal Variables
    removingGroup: UserGroup = null;
    removeModal: boolean = false;
    removeModalMode: string = null;

    constructor(
        private groupsService: GroupsService,
        private loaderService: LoaderService,
        private myPocketsService: MyPocketsService
    ) {
      this.subscription = this.loaderService.loaderState.subscribe(
        (state: LoaderState) => {
          this.appLoader = state.show;
        }
      );
    }

    ngOnInit() {
        this.getUserGroups();
        this.getGroupColors();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    getGroupColors() {
        this.myGroupColors = this.myPocketsService.getMyPocketsColor();
    }

    getUserGroups() {
      this.tableLoaded = false;

      this.subscription = this.groupsService
        .getUserGroups()
        .subscribe((result) => {
          if (result.data) {
            this.tableLoaded = true;
            this.userGroups = result.data;
          }
        });
    }

  handleRemoveModal(group: UserGroup, mode: string) {
    this.removeModalMode = mode;
    this.removingGroup = group;
    this.removeModal = !this.removeModal;
  }

  handleDetailsGroupsModal(
    mode: string | null,
    name?: string,
    color?: string,
    id?: number | string
  ) {
    this.showModalsLoader = false;
    switch (mode) {
      case 'create':
        this.detailsGroupModal = true;
        this.detailsGroupMode = mode;
        break;
      case 'edit':
        this.detailsGroupModal = true;
        this.detailsGroupMode = mode;
        this.newGroupName = name;
                this.newGroupColor = '#' + color;
                this.editingGroupId = id;
                break;
            default:
              this.detailsGroupModal = null;
              this.detailsGroupMode = mode;
                break;
        }
    }

    clearModalOptions() {
        this.newGroupName = null;
      this.newGroupColor = null;
      this.modalErrors = {
        newGroupName: null,
        newGroupColor: null
      };
    }

    selectNewGroupColor(color: string | null) {
        this.newGroupColor = color;
        this.modalErrors.newGroupColor = null;
    }

    newGroupSubmit() {
        const validate = this.detailsModalValidate();

        if (validate === 'valid') {
          const params = {
            name: this.newGroupName,
            color: this.newGroupColor.slice(1)
          };

          this.showModalsLoader = true;
          this.detailsGroupMode === 'create'
            ? this.createNewGroup(params)
            : this.editGroup(params);
        }
    }

    detailsModalValidate() {
        let nameMessage: string = null;
        let colorMessage: string = null;
        let errors = {
            newGroupName: null,
            newGroupColor: null
        };

      if (!this.newGroupName) {
        nameMessage = 'The name field is required';
      }

      if (this.newGroupName && this.newGroupName.length > 35) {
        nameMessage = 'Max number of characters is 35';
      }

      colorMessage = !this.newGroupColor
        ? 'The color field is required'
        : null;
      errors.newGroupName = nameMessage;
      errors.newGroupColor = colorMessage;
      this.modalErrors = {...errors};

      return nameMessage || colorMessage ? 'invalid' : 'valid';
    }

  createNewGroup(params: { name: string; color: string }) {
    this.subscription = this.groupsService
      .createGroup(params)
      .subscribe((result) => {
        if (result.data) {
          this.finishCreatingProcess();
        } else {
          console.log('Error while creating group'); // Refine handle error
        }
      });
  }

  editGroup(params: { name: string; color: string }) {
    const editParams = {...params, id: this.editingGroupId};

    this.subscription = this.groupsService
      .editGroup(editParams)
      .subscribe((result) => {
        if (result.data) {
          this.finishCreatingProcess();
        } else {
          console.log('Error while editing group'); // Refine handle error
        }
      });
  }

    finishCreatingProcess() {
      this.showModalsLoader = false;
      this.handleDetailsGroupsModal(null);
      this.tableLoaded = false;
        this.getUserGroups();
    }
}
