import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { useFileStore } from '../../store/fileStore';
import colors from '../../constants/colors';
import { CATEGORIES } from '../../constants/mockData';
import { FileItem as FileItemType, FileType } from '../../types';
import { pickDocument, shareFile } from '../../utils/fileUtils';
import { Plus, Upload } from 'lucide-react-native';

// Components
import SearchBar from '../../components/SearchBar';
import CategoryCard from '../../components/CategoryCard';
import FileItem from '../../components/FileItem';
import { FilterModal } from '../../components/FilterModal';
import FileActionSheet from '../../components/FileActionSheet';
import CreateFileModal from '../../components/CreateFileModal';
import RenameModal from '../../components/RenameModal';

export default function HomeScreen() {
  const router = useRouter();
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItemType | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState({
    sizeMin: 0,
    sizeMax: Infinity,
    dateFrom: null,
    dateTo: null,
  });
  
  // File store
  const { 
    files, 
    addFile, 
    removeFile, 
    updateFile, 
    moveToSecure,
    selectedFiles,
    selectFile,
    deselectFile,
    clearSelection,
    setSearchQuery: storeSetSearchQuery,
  } = useFileStore();
  
  // Effects
  useEffect(() => {
    storeSetSearchQuery(searchQuery);
  }, [searchQuery]);
  
  // Handlers
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  const handleFilterPress = () => {
    setShowFilterModal(true);
  };
  
  const handleApplyFilter = (type: string, filters?: any) => {
    setSelectedFilter(type);
    if (filters) {
      setAdvancedFilters(filters);
    }
  };
  
  const handleCategoryPress = (category: any) => {
    setSelectedFilter(category.type);
  };
  
  const handleFilePress = (file: FileItemType) => {
    if (selectedFiles.length > 0) {
      // In selection mode
      if (selectedFiles.includes(file.id)) {
        deselectFile(file.id);
      } else {
        selectFile(file.id);
      }
    } else {
      // Normal mode - open file
      if (file.isDirectory) {
        // Navigate to directory
        Alert.alert('Open Folder', `Opening folder: ${file.name}`);
      } else {
        // Open file viewer
        router.push(`/file-viewer?id=${file.id}`);
      }
    }
  };
  
  const handleFileLongPress = (file: FileItemType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (selectedFiles.length > 0) {
      // Already in selection mode
      if (selectedFiles.includes(file.id)) {
        deselectFile(file.id);
      } else {
        selectFile(file.id);
      }
    } else {
      // Enter selection mode
      selectFile(file.id);
    }
  };
  
  const handleFileOptions = (file: FileItemType) => {
    setSelectedFile(file);
    setShowActionSheet(true);
  };
  
  const handleCreateFile = (name: string) => {
    const newFile: FileItemType = {
      id: Date.now().toString(),
      name,
      path: `/storage/emulated/0/Documents/${name}`,
      size: 0,
      type: 'document',
      isDirectory: false,
      modifiedTime: new Date().toISOString(),
    };
    
    addFile(newFile);
    Alert.alert('Success', `File "${name}" created successfully`);
  };
  
  const handleCreateFolder = (name: string) => {
    const newFolder: FileItemType = {
      id: Date.now().toString(),
      name,
      path: `/storage/emulated/0/Documents/${name}`,
      size: 0,
      type: 'document',
      isDirectory: true,
      modifiedTime: new Date().toISOString(),
    };
    
    addFile(newFolder);
    Alert.alert('Success', `Folder "${name}" created successfully`);
  };
  
  const handleImportFile = async () => {
    const result = await pickDocument();
    if (result) {
      const newFile: FileItemType = {
        id: Date.now().toString(),
        name: result.name,
        path: result.uri,
        uri: result.uri,
        size: result.size,
        type: result.type as FileType,
        isDirectory: false,
        modifiedTime: new Date().toISOString(),
      };
      
      addFile(newFile);
      Alert.alert('Success', `File "${result.name}" imported successfully`);
    }
  };
  
  const handleShareFile = (file: FileItemType) => {
    if (file.uri) {
      shareFile(file.uri);
    } else {
      Alert.alert('Error', 'Cannot share this file');
    }
  };
  
  const handleRenameFile = (file: FileItemType) => {
    setSelectedFile(file);
    setShowRenameModal(true);
  };
  
  const handleRenameConfirm = (file: FileItemType, newName: string) => {
    updateFile(file.id, { name: newName });
    Alert.alert('Success', `File renamed to "${newName}"`);
  };
  
  const handleDeleteFile = (file: FileItemType) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${file.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            removeFile(file.id);
            Alert.alert('Success', `"${file.name}" deleted successfully`);
          }
        },
      ]
    );
  };
  
  const handleCopyFile = (file: FileItemType) => {
    router.push({
      pathname: '/folder-picker',
      params: { fileId: file.id, operation: 'copy' }
    });
  };
  
  const handleMoveFile = (file: FileItemType) => {
    router.push({
      pathname: '/folder-picker',
      params: { fileId: file.id, operation: 'move' }
    });
  };
  
  const handleSecureFile = (file: FileItemType) => {
    moveToSecure(file.id);
    Alert.alert('Success', `"${file.name}" moved to secure folder`);
  };
  
  const handleRemoveFromSecure = (file: FileItemType) => {
    Alert.alert('Remove from Secure', 'This would remove the file from secure storage');
  };
  
  // Computed values
  const filteredFiles = files.filter(file => {
    // Apply search filter
    const matchesSearch = searchQuery 
      ? file.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    // Apply type filter
    const matchesType = selectedFilter === 'all' 
      ? true 
      : file.type === selectedFilter;
    
    // Apply advanced filters
    const fileDate = new Date(file.modifiedTime).getTime();
    const matchesSize = file.size >= advancedFilters.sizeMin && file.size <= advancedFilters.sizeMax;
    
    const matchesDate = true; // Default if no date filters
    if (advancedFilters.dateFrom && advancedFilters.dateTo) {
      const fromDate = new Date(advancedFilters.dateFrom).getTime();
      const toDate = new Date(advancedFilters.dateTo).getTime();
      if (fromDate && toDate) {
        return matchesSearch && matchesType && matchesSize && (fileDate >= fromDate && fileDate <= toDate);
      }
    }
    
    return matchesSearch && matchesType && matchesSize && matchesDate;
  });
  
  const categoryCounts = CATEGORIES.map(category => {
    const count = files.filter(file => file.type === category.type).length;
    return { ...category, count };
  });
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>FileEase</Text>
        
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            onFilterPress={handleFilterPress}
            onClear={handleClearSearch}
          />
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Create</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={handleImportFile}
          >
            <Upload size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Import</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categoryCounts.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                count={category.count}
                onPress={handleCategoryPress}
              />
            ))}
          </ScrollView>
        </View>
        
        {/* Recent Files */}
        <View style={styles.filesSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {selectedFilter === 'all' ? 'All Files' : CATEGORIES.find(c => c.type === selectedFilter)?.name || 'Files'}
          </Text>
          
          {filteredFiles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.subtext }]}>
                No files found
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredFiles}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <FileItem
                  file={item}
                  onPress={handleFilePress}
                  onLongPress={handleFileLongPress}
                  onOptionsPress={handleFileOptions}
                  isSelected={selectedFiles.includes(item.id)}
                />
              )}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
      
      {/* Modals */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilter={handleApplyFilter}
        currentFilter={selectedFilter}
        advancedFilters={advancedFilters}
      />
      
      <FileActionSheet
        file={selectedFile}
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        onShare={handleShareFile}
        onRename={handleRenameFile}
        onDelete={handleDeleteFile}
        onCopy={handleCopyFile}
        onMove={handleMoveFile}
        onSecure={handleSecureFile}
        onRemoveFromSecure={handleRemoveFromSecure}
      />
      
      <CreateFileModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateFile={handleCreateFile}
        onCreateFolder={handleCreateFolder}
      />
      
      <RenameModal
        file={selectedFile}
        visible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onRename={handleRenameConfirm}
      />
      
      {/* Selection Mode Footer */}
      {selectedFiles.length > 0 && (
        <View style={[styles.selectionFooter, { backgroundColor: theme.card }]}>
          <Text style={[styles.selectionText, { color: theme.text }]}>
            {selectedFiles.length} selected
          </Text>
          
          <TouchableOpacity
            style={[styles.selectionButton, { backgroundColor: theme.danger }]}
            onPress={() => {
              Alert.alert(
                'Delete Files',
                `Are you sure you want to delete ${selectedFiles.length} files?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: () => {
                      selectedFiles.forEach(id => removeFile(id));
                      clearSelection();
                      Alert.alert('Success', 'Files deleted successfully');
                    }
                  },
                ]
              );
            }}
          >
            <Text style={styles.selectionButtonText}>Delete</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.selectionButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              Alert.alert('Move to Secure', 'Files will be moved to secure storage');
              selectedFiles.forEach(id => moveToSecure(id));
              clearSelection();
            }}
          >
            <Text style={styles.selectionButtonText}>Secure</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.selectionButton, { backgroundColor: theme.border }]}
            onPress={clearSelection}
          >
            <Text style={[styles.selectionButtonText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 50, // Add extra padding at the top since we removed the header
  },
  title: {
    fontSize: 24,
    padding: 6,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingRight: 16,
  },
  filesSection: {
    marginBottom: 24,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  selectionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 16,
  },
  selectionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  selectionButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});