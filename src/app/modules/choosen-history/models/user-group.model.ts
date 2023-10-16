import { GroupRole } from '../enums/group-role.enum';
import { UserSharedModel } from './user-shared.model';

export class UserGroup {
  constructor(
    public admin: UserSharedModel,
    public color: string,
    public count: number,
    public createdAt: string,
    public createdBy: string,
    public id: string,
    public name: string,
    public updatedAt: string,
    public updatedBy: string | null,
    public userRole: GroupRole,
    public users: any[]
  ) {
  }
}
