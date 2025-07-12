import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FileItem } from '../types';
import { MOCK_FILES } from '../constants/mockData';
import { getFileType } from '../utils/fileUtils';

interface FileState {
  files: FileItem[];
  secureFiles: FileItem[];
  selectedFiles: string[];
  currentPath: string;
  searchQuery: string;
  
  // Actions
  addFile: (file: FileItem) => void;
  removeFile: (fileId: string) => void;
  updateFile: (fileId: string, updates: Partial<FileItem>) => void;
  moveToSecure: (fileId: string) => void;
  removeFromSecure: (fileId: string) => void;
  copyFile: (fileId: string, destinationFolderId: string) => void;
  moveFile: (fileId: string, destinationFolderId: string) => void;
  selectFile: (fileId: string) => void;
  deselectFile: (fileId: string) => void;
  clearSelection: () => void;
  setCurrentPath: (path: string) => void;
  setSearchQuery: (query: string) => void;
  getFilteredFiles: (type?: string) => FileItem[];
}

export const useFileStore = create<FileState>()(
  persist(
    (set, get) => ({
      files: MOCK_FILES,
      secureFiles: MOCK_FILES.filter(file => file.isSecure),
      selectedFiles: [],
      currentPath: '/',
      searchQuery: '',
      
      addFile: (file) => set((state) => {
        // Auto-detect file type if not provided
        if (!file.type && file.name) {
          file.type = getFileType(file.name);
        }
        
        return {
          files: [...state.files, file]
        };
      }),
      
      removeFile: (fileId) => set((state) => ({
        files: state.files.filter(file => file.id !== fileId),
        secureFiles: state.secureFiles.filter(file => file.id !== fileId)
      })),
      
      updateFile: (fileId, updates) => set((state) => ({
        files: state.files.map(file => 
          file.id === fileId ? { ...file, ...updates } : file
        ),
        secureFiles: state.secureFiles.map(file => 
          file.id === fileId ? { ...file, ...updates } : file
        )
      })),
      
      moveToSecure: (fileId) => set((state) => {
        const file = state.files.find(f => f.id === fileId);
        if (!file) return state;
        
        const updatedFile = { ...file, isSecure: true };
        
        return {
          files: state.files.map(f => f.id === fileId ? updatedFile : f),
          secureFiles: [...state.secureFiles, updatedFile]
        };
      }),
      
      removeFromSecure: (fileId) => set((state) => {
        const file = state.secureFiles.find(f => f.id === fileId);
        if (!file) return state;
        
        const updatedFile = { ...file, isSecure: false };
        
        return {
          files: state.files.map(f => f.id === fileId ? updatedFile : f),
          secureFiles: state.secureFiles.filter(f => f.id !== fileId)
        };
      }),
      
      copyFile: (fileId, destinationFolderId) => set((state) => {
        const file = state.files.find(f => f.id === fileId);
        const destinationFolder = state.files.find(f => f.id === destinationFolderId);
        
        if (!file || !destinationFolder || !destinationFolder.isDirectory) {
          return state;
        }
        
        // Create a copy of the file with a new ID
        const fileCopy: FileItem = {
          ...file,
          id: Date.now().toString(), // New ID for the copy
          path: `${destinationFolder.path}/${file.name}`,
          modifiedTime: new Date().toISOString(),
        };
        
        return {
          files: [...state.files, fileCopy]
        };
      }),
      
      moveFile: (fileId, destinationFolderId) => set((state) => {
        const file = state.files.find(f => f.id === fileId);
        const destinationFolder = state.files.find(f => f.id === destinationFolderId);
        
        if (!file || !destinationFolder || !destinationFolder.isDirectory) {
          return state;
        }
        
        // Update the file's path
        const updatedFile = {
          ...file,
          path: `${destinationFolder.path}/${file.name}`,
          modifiedTime: new Date().toISOString(),
        };
        
        return {
          files: state.files.map(f => f.id === fileId ? updatedFile : f)
        };
      }),
      
      selectFile: (fileId) => set((state) => ({
        selectedFiles: [...state.selectedFiles, fileId]
      })),
      
      deselectFile: (fileId) => set((state) => ({
        selectedFiles: state.selectedFiles.filter(id => id !== fileId)
      })),
      
      clearSelection: () => set({ selectedFiles: [] }),
      
      setCurrentPath: (path) => set({ currentPath: path }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      getFilteredFiles: (type) => {
        const { files, searchQuery } = get();
        
        let filtered = files;
        
        // Filter by type if provided
        if (type && type !== 'all') {
          filtered = filtered.filter(file => file.type === type);
        }
        
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(file => 
            file.name.toLowerCase().includes(query)
          );
        }
        
        return filtered;
      }
    }),
    {
      name: 'file-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        files: state.files,
        secureFiles: state.secureFiles,
      }),
    }
  )
);