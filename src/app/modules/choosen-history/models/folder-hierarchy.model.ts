export default interface FolderHierarchy {
  children: FolderHierarchy[];
  color: null | string;
  count: {
    folders: number;
    contents: number;
  };
  id: number;
  name: string;
  parentId: number;
}
