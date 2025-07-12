export type FileType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  type: FileType;
  isDirectory: boolean;
  modifiedTime: string;
  uri?: string;
  thumbnail?: string;
  isSecure?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: FileType;
}

export interface CloudService {
  id: string;
  name: string;
  icon: string;
  url: string;
}