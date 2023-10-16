import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { GroupsService } from '../../../services/groups.service';
import { LoaderService } from '../../../../shared/components/loader/loader.service';

import { UserSharedModel } from '../../../models/user-shared.model';
import { LoaderState } from '../../../../shared/components/loader/loader';
import { GroupRole } from '../../../enums/group-role.enum';

@Component({
    selector: 'app-account-group-item',
    templateUrl: './group-item.component.html',
    styleUrls: ['./group-item.component.scss'],
    providers: [GroupsService]
})
export class GroupItemComponent implements OnInit, OnDestroy {
    subscription: Subscription;
    appLoader: boolean = false;
    modalLoader: boolean = false;
    tableLoaded: boolean = false;
    removeModal: boolean = false;
    groupId: number | string = null;
    groupMembers: UserSharedModel[] = [];
    userRolesList = GroupRole;
    newUserInput: string;
    newUserRole: any;
  newUserErrors: { input: string; select: string } = {
    input: null,
    select: null
  };
  allUserRoles: any[];
    removingUser: UserSharedModel = null;
    inviteEmail: string = null;
    inviteName: string = null;
    inviteModal: boolean = false;
    inviteError: boolean = false;

    constructor(
        private activateRoute: ActivatedRoute,
        private groupsService: GroupsService,
        private loaderService: LoaderService
    ) {
      this.subscription = this.loaderService.loaderState.subscribe(
        (state: LoaderState) => {
          this.appLoader = state.show;
        }
      );

      this.subscription = this.activateRoute.params.subscribe((params) => {
        this.groupId = params.id;
      });
    }

    ngOnInit() {
        this.getGroupItem();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    getGroupItem() {
      this.tableLoaded = false;

      this.subscription = this.groupsService
        .getUsersForGroup(this.groupId)
        .subscribe((result) => {
          if (result.data) {
            this.tableLoaded = true;
            this.groupMembers = result.data.users;
          }
        });
    }

    handleRemoveModal(removingUser: UserSharedModel) {
        this.removingUser = removingUser;
        this.removeModal = !this.removeModal;
    }

    addUserToGroup(groupId: number | string) {
        const valid = this.newUserValidate();

        if (valid) {
          this.subscription = this.groupsService
            .addUserToGroup(groupId, this.newUserInput)
            .subscribe(
              (result) => {
                if (result.data) {
                  this.clearNewUserInfo();
                  this.getGroupItem();
                }
              },
              (error) => {
                if (error.Message === 'User not found') {
                  this.inviteEmail = this.newUserInput;
                  this.inviteModal = true;
                  this.clearNewUserInfo();
                }
              }
            );
        }
    }

    inviteUserSubmit() {
        this.modalLoader = false;
        this.inviteError = this.inviteName ? false : true;
      const params = {
        email: this.inviteEmail,
        userName: this.inviteName
      };

        if (!this.inviteError) {
          this.modalLoader = true;
          this.subscription = this.groupsService
            .inviteUserToGroup(this.groupId, params)
            .subscribe(
              (result) => {
                if (result.data) {
                  this.clearNewUserInfo();
                  this.modalLoader = false;
                  this.inviteModal = false;
                  this.getGroupItem();
                }
              },
              (error) => {
                this.clearInviteModalInfo();
                this.inviteModal = false;
                this.modalLoader = false;
              }
            );
        }
    }

    clearInviteModalInfo() {
        this.inviteError = false;
        this.inviteName = null;
        this.inviteEmail = null;
    }

    clearNewUserInfo() {
        this.newUserErrors = {
            input: null,
            select: null
        };
        this.newUserInput = null;
        this.newUserRole = null;
    }

    newUserValidate() {
        let inputMessage: string = null;
        let selectMessage: string = null;
        const regExp = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;

        selectMessage = !this.newUserRole ? 'The role is required' : null;
        inputMessage = !this.newUserInput ? 'The email is required' : null;

        if (this.newUserInput && !this.newUserInput.match(regExp)) {
            inputMessage = 'Email patter is invalid';
        }

        this.newUserErrors.select = selectMessage;
        this.newUserErrors.input = inputMessage;

      return inputMessage || selectMessage ? false : true;
    }

    removeUserFromGroup(groupId: number, userId: string) {
      this.tableLoaded = false;
      this.removeModal = false;

      this.subscription = this.groupsService
        .removeUserFromGroup(groupId, userId)
        .subscribe((result) => {
          if (result.data) {
            this.tableLoaded = true;
            this.getGroupItem();
          }
        });
    }

    handleRolesDropdowd() {
      this.allUserRoles = [
        {id: 1, name: 'Owner'},
        {id: 2, name: 'Admin'},
        {id: 3, name: 'Member'}
      ];
    }
}
