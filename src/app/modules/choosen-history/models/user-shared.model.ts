import { FolderContentRole } from '../enums/folder-content-role.enum';

export class UserSharedModel {
    constructor(
      public contactNumber: string,
      public emailId: string,
      public firstName: string,
      public lastName: string,
      public id: string,
      public profilePictureFileId: string,
      public profilePictureThumbnailId: string,
      public profilePictureThumbnailUrl: string,
      public role: FolderContentRole,
      public organizationId: number
    ) {
    }
}
