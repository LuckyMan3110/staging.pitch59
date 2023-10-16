import { BusinessDetails } from '../../business/models/business-detail.model';
import { FolderContentRole } from '../enums/folder-content-role.enum';

export class MyPitchCardFolder {
    constructor(
      public color: string,
      public content: BusinessDetails,
      public count: number,
      public id: number,
      public name: string,
      public role: FolderContentRole,
      public order: number,
      public type: string,
      public updatedAt: number,
      public children?: any[],
      public organizationId?: number
    ) {
    }
}
