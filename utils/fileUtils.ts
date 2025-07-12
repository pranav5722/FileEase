import { FileType } from '../types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

export const getFileType = (fileName: string): FileType => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic'];
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', '3gp'];
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'];
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv'];
  const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
  
  if (imageExtensions.includes(extension)) return 'image';
  if (videoExtensions.includes(extension)) return 'video';
  if (audioExtensions.includes(extension)) return 'audio';
  if (documentExtensions.includes(extension)) return 'document';
  if (archiveExtensions.includes(extension)) return 'archive';
  
  return 'other';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const shareFile = async (fileUri: string): Promise<void> => {
  if (Platform.OS === 'web') {
    console.log('Sharing not available on web');
    return;
  }
  
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri);
    } else {
      console.log('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error sharing file:', error);
  }
};

export const pickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });
    
    if (result.canceled) {
      return null;
    }
    
    const file = result.assets[0];
    return {
      name: file.name,
      uri: file.uri,
      size: file.size || 0,
      type: getFileType(file.name),
    };
  } catch (error) {
    console.error('Error picking document:', error);
    return null;
  }
};

export const createDirectory = async (directoryPath: string): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      console.log('File system operations not fully supported on web');
      return false;
    }
    
    const dirInfo = await FileSystem.getInfoAsync(directoryPath);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(directoryPath, { intermediates: true });
    }
    return true;
  } catch (error) {
    console.error('Error creating directory:', error);
    return false;
  }
};

export const deleteFile = async (fileUri: string): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      console.log('File system operations not fully supported on web');
      return false;
    }
    
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export const copyFile = async (sourceUri: string, destinationUri: string): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      console.log('File system operations not fully supported on web');
      return false;
    }
    
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri
    });
    return true;
  } catch (error) {
    console.error('Error copying file:', error);
    return false;
  }
};

export const moveFile = async (sourceUri: string, destinationUri: string): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      console.log('File system operations not fully supported on web');
      return false;
    }
    
    await FileSystem.moveAsync({
      from: sourceUri,
      to: destinationUri
    });
    return true;
  } catch (error) {
    console.error('Error moving file:', error);
    return false;
  }
};

export const renameFile = async (fileUri: string, newName: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      console.log('File system operations not fully supported on web');
      return null;
    }
    
    const pathParts = fileUri.split('/');
    const oldName = pathParts.pop() || '';
    const dirPath = pathParts.join('/');
    const newUri = `${dirPath}/${newName}`;
    
    await FileSystem.moveAsync({
      from: fileUri,
      to: newUri
    });
    
    return newUri;
  } catch (error) {
    console.error('Error renaming file:', error);
    return null;
  }
};