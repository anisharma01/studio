export type FileSystemItem = Folder | File | Link;

export type Item = {
  id: string;
  name: string;
  parentId: string | null;
  tags: string[];
};

export interface Folder extends Item {
  type: 'folder';
}

export interface File extends Item {
  type: 'file';
  fileType: string;
  size: number;
}

export interface Link extends Item {
  type: 'link';
  url: string;
}
