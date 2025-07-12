import { Category, CloudService, FileItem } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Images',
    icon: 'image',
    color: '#FF6B6B',
    type: 'image',
  },
  {
    id: '2',
    name: 'Videos',
    icon: 'video',
    color: '#4ECDC4',
    type: 'video',
  },
  {
    id: '3',
    name: 'Audio',
    icon: 'music',
    color: '#FFD166',
    type: 'audio',
  },
  {
    id: '4',
    name: 'Documents',
    icon: 'file-text',
    color: '#6A0572',
    type: 'document',
  },
  {
    id: '5',
    name: 'Archives',
    icon: 'archive',
    color: '#F9844A',
    type: 'archive',
  },
  {
    id: '6',
    name: 'Others',
    icon: 'file',
    color: '#4A6FFF',
    type: 'other',
  },
];

export const CLOUD_SERVICES: CloudService[] = [
  {
    id: '1',
    name: 'Google Drive',
    icon: 'hard-drive',
    url: 'https://drive.google.com',
  },
  {
    id: '2',
    name: 'Dropbox',
    icon: 'droplet',
    url: 'https://www.dropbox.com',
  },
  {
    id: '3',
    name: 'OneDrive',
    icon: 'cloud',
    url: 'https://onedrive.live.com',
  },
];

export const MOCK_FILES: FileItem[] = [
  {
    id: '1',
    name: 'Vacation Photo.jpg',
    path: '/storage/emulated/0/Pictures/Vacation Photo.jpg',
    size: 1024 * 1024 * 2.5, // 2.5 MB
    type: 'image',
    isDirectory: false,
    modifiedTime: new Date(2023, 5, 15).toISOString(),
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  },
];