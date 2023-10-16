import { Injectable } from '@angular/core';
import { RestApiService } from '../../shared/services/rest-api.service';
import { Observable } from 'rxjs';

interface NewGroupParams {
    name: string;
    color: string;
}

interface EditGroupParams {
    id: number | string;
    name: string;
    color: string;
}

interface InviteUserParams {
    email: string;
    userName: string;
}

@Injectable()
export class GroupsService {
    constructor(private restApiService: RestApiService) {
    }

    getUserGroups(): Observable<any> {
        return this.restApiService.get('get-user-group', `organization/list`);
    }

    createGroup(params: NewGroupParams): Observable<any> {
        return this.restApiService.post('create-group', `organization`, params);
    }

    editGroup(params: EditGroupParams): Observable<any> {
      const query = params.id;
      const editParams = {
        name: params.name,
        color: params.color
      };

      return this.restApiService.put(
        'edit-group',
        `organization/${query}`,
        editParams
      );
    }

    getUsersForGroup(id: string | number): Observable<any> {
      return this.restApiService.get(
        'get-user-group',
        `organization/${id}/list`
      );
    }

    getInvitedUsersGroup(groupId: number | string): Observable<any> {
      return this.restApiService.get(
        'get-invited-users-group',
        `organization/${groupId}/invite/list`
      );
    }

    addUserToGroup(groupId: number | string, email: string): Observable<any> {
      return this.restApiService.post(
        'add-user-to-group',
        `organization/${groupId}/user-by-email?email=${email}`,
        null
      );
    }

  removeUserFromGroup(groupId: number, userId: string): Observable<any> {
    return this.restApiService.delete(
      'remove-user-from-group',
      `organization/${groupId}/user/${userId}`
    );
  }

  inviteUserToGroup(
    groupId: string | number,
    params: InviteUserParams
  ): Observable<any> {
    return this.restApiService.post(
      'invite-user-to-group',
      `organization/${groupId}/invite`,
      params
    );
  }

  getUsersInUsersGroup(name: string, limit: number = 20): Observable<any> {
    return this.restApiService.get(
      'get-user-group-suggest',
      `organization/user/suggest?name=${name}&limit=${limit}`
    );
  }
}
