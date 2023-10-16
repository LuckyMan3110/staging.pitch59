export class MyPocket {
    constructor(
      public userId: number,
      public name: string,
      public color: number | string,
      public id: number,
      public content: any[],
      public createdAt: number,
      public createdBy: number,
      public updatedAt: number,
      public updatedBy: number | null,
      public organizationId: number
    ) {
    }
}
