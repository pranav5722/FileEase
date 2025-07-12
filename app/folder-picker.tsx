import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSettingsStore } from '../store/settingsStore';
import { useFileStore } from '../store/fileStore';
import colors from '../constants/colors';
import { FileItem as FileItemType } from '../types';
import { Folder, ArrowLeft, Check } from 'lucide-react-native';

export default function FolderPickerScreen() {
  const { fileId, operation } = useLocalSearchParams<{ fileId: string, operation: string }>();
  const router = useRouter();
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  const { files, copyFile, moveFile } = useFileStore();
  const [folders, setFolders] = useState<FileItemType[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  
  const sourceFile = files.find(f => f.id === fileId);
  
  useEffect(() => {
    // Get all folders
    const allFolders = files.filter(file => 
      file.isDirectory && 
      file.id !== fileId // Don't include the source file if it's a folder
    );
    setFolders(allFolders);
  }, [files, fileId]);
  
  const handleFolderPress = (folder: FileItemType) => {
    setSelectedFolder(folder.id);
  };
  
  const handleConfirm = () => {
    if (!selectedFolder || !sourceFile) {
      Alert.alert('Error', 'Please select a destination folder');
      return;
    }
    
    const destinationFolder = folders.find(f => f.id === selectedFolder);
    if (!destinationFolder) {
      Alert.alert('Error', 'Selected folder not found');
      return;
    }
    
    if (operation === 'copy') {
      copyFile(sourceFile.id, destinationFolder.id);
      Alert.alert(
        'Success', 
        `"${sourceFile.name}" copied to "${destinationFolder.name}"`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else if (operation === 'move') {
      moveFile(sourceFile.id, destinationFolder.id);
      Alert.alert(
        'Success', 
        `"${sourceFile.name}" moved to "${destinationFolder.name}"`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };
  
  const renderFolder = ({ item }: { item: FileItemType }) => (
    <TouchableOpacity
      style={[
        styles.folderItem,
        selectedFolder === item.id && { backgroundColor: theme.primary + '20' },
        { borderColor: theme.border }
      ]}
      onPress={() => handleFolderPress(item)}
    >
      <View style={styles.folderInfo}>
        <Folder size={24} color={theme.primary} style={styles.folderIcon} />
        <Text style={[styles.folderName, { color: theme.text }]}>{item.name}</Text>
      </View>
      
      {selectedFolder === item.id && (
        <Check size={20} color={theme.primary} />
      )}
    </TouchableOpacity>
  );
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: `Select Destination Folder`,
          headerRight: () => (
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleConfirm}
              disabled={!selectedFolder}
            >
              <Text 
                style={[
                  styles.confirmText, 
                  { color: selectedFolder ? theme.primary : theme.subtext }
                ]}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {sourceFile && (
          <View style={[styles.sourceFileInfo, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.operationText, { color: theme.text }]}>
              {operation === 'copy' ? 'Copy:' : 'Move:'}
            </Text>
            <Text style={[styles.sourceFileName, { color: theme.text }]} numberOfLines={1}>
              {sourceFile.name}
            </Text>
          </View>
        )}
        
        {folders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              No folders available
            </Text>
          </View>
        ) : (
          <FlatList
            data={folders}
            renderItem={renderFolder}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.folderList}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sourceFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  operationText: {
    fontWeight: '600',
    marginRight: 8,
  },
  sourceFileName: {
    flex: 1,
  },
  folderList: {
    paddingBottom: 20,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  folderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderIcon: {
    marginRight: 12,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  confirmButton: {
    paddingHorizontal: 16,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
  },
});