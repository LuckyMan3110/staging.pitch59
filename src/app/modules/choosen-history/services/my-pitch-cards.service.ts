import { Injectable } from '@angular/core';
import { RestApiService } from '../../shared/services/rest-api.service';
import { Observable } from 'rxjs';

interface NewFolderParams {
    name: string;
    color: string;
    parentId?: number;
}

interface EditFolderParams {
    id: number;
    name: string;
    color: string;
}

interface AddContentParams {
    folderId: number;
    contentIds: number[];
}

interface RemoveContentParams {
    contentIds: number[];
    withContent: boolean;
}

@Injectable()
export class MyPitchCardsService {
  constructor(private restApiService: RestApiService) {
  }

  getPitchCards(folderId: number | string): Observable<any> {
    return this.restApiService.get(
      'get-hight-level-pitchcards',
      `folder/${folderId}/content`
    );
  }

  getSharedPitchCards(
    folderId: number | string,
    organizationId: number = null
  ): Observable<any> {
    if (organizationId) {
      return this.restApiService.get(
        'get-hight-level-pitchcards',
        `folder/shared/${folderId}/content?organizationId=${organizationId}`
      );
    } else {
      return this.restApiService.get(
        'get-hight-level-pitchcards',
        `folder/shared/${folderId}/content`
      );
    }
    }

    createNewFolder(params: NewFolderParams): Observable<any> {
      const {name, color, parentId} = params;

      return this.restApiService.post(
        'create-folder',
        `folder?Name=${name}&Color=${color.slice(1)}&ParentId=${parentId}`,
        null
      );
    }

    createNewSharedFolder(params: NewFolderParams): Observable<any> {
      const {name, color, parentId} = params;

      return this.restApiService.post(
        'create-folder',
        `shared/folder?Name=${name}&Color=${color.slice(
          1
        )}&ParentId=${parentId}`,
        null
      );
    }

    editFolder(params: EditFolderParams): Observable<any> {
      const {name, color, id} = params;

      return this.restApiService.put(
        'update-folder',
        `folder?Id=${id}&Color=${color.slice(1)}&Name=${name}`
      );
    }

    editSharedFolder(params: EditFolderParams): Observable<any> {
      const {name, color, id} = params;

      return this.restApiService.put(
        'update-folder',
        `shared/folder?Id=${id}&Color=${color.slice(1)}&Name=${name}`
      );
    }

    addContentToFolder(params: AddContentParams): Observable<any> {
      const {folderId, contentIds} = params;

      return this.restApiService.post(
        'add-content',
        `folder/${folderId}/content`,
        contentIds
      );
    }

    getFolderHierarchy(folderId: number | string): Observable<any> {
      return this.restApiService.get(
        'get-hierarchy',
        `folder/${folderId}/hierarchy`
      );
    }

    getSharedFolderHierarchy(folderId: number | string): Observable<any> {
      return this.restApiService.get(
        'get-hierarchy',
        `folder/${folderId}/hierarchy`
      );
    }

    getFolderContentUsers(folderId: number): Observable<any> {
      return this.restApiService.get(
        'get-folder-content-users',
        `folder/${folderId}/access`
      );
    }

    removeContent(params: RemoveContentParams): Observable<any> {
      const {contentIds, withContent} = params;

      return this.restApiService.delete(
        'remove-content',
        `folder?withContent=${withContent}`,
        'page-center',
        contentIds
      );
    }

  addAccessForUser(
    folderContentId: number,
    userId: string,
    organizationId: number,
    role: number
  ) {
    return this.restApiService.post(
      'add-access-for-user',
      `folder/${folderContentId}/access?userId=${userId}&organizationId=${organizationId}&role=${role}`,
      null,
      null
    );
  }

  addUserToBusinessByEmail(businessId: string, email: string, role: string) {
    return this.restApiService.post(
      'add-access-for-user-by-email',
      `folder/business/${businessId}/access-by-email`,
      {email, role},
      null
    );
  }

  removeAccessForUser(
    folderContentId: number,
    userId: string,
    organizationId: string
  ) {
    organizationId = organizationId
      ? `&organizationId=${organizationId}`
      : '';
    return this.restApiService.delete(
      'remove-access-for-user',
      `folder/${folderContentId}/access?userId=${userId}${organizationId}`,
      null
    );
  }

  updateAccessForUser(
    folderContentId: number,
    userId: string,
    organizationId: number,
    role: number
  ) {
    return this.restApiService.put(
      'add-access-for-user',
      `folder/${folderContentId}/access?userId=${userId}&organizationId=${organizationId}&role=${role}`,
      null,
      null
    );
  }
}
