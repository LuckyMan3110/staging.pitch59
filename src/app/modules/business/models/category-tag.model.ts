import { TagType } from '../enums/tag-type.enum';

export class CategoryTag {
  constructor(
    public descriptors: string,
    public id: number,
    public name: string,
    public order: number,
    public type: TagType = TagType.CategoryTag
  ) {
  }
}
