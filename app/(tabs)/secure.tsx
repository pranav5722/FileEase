import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../store/settingsStore';
import { useFileStore } from '../../store/fileStore';
import colors from '../../constants/colors';
import { FileItem as FileItemType } from '../../types';
import { shareFile } from '../../utils/fileUtils';
import { Fingerprint, Lock } from 'lucide-react-native';

// Components
import FileItem from '../../components/FileItem';
import FileActionSheet from '../../components/FileActionSheet';
import RenameModal from '../../components/RenameModal';
import PinModal from '../../components/PinModal';

export default function SecureScreen() {
  const router = useRouter();
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  // State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItemType | null>(null);
  
  // Settings and files
  const { pin, useBiometrics } = useSettingsStore();
  const { 
    secureFiles, 
    removeFile, 
    updateFile, 
    removeFromSecure,
  } = useFileStore();
  
  // Effects
  useEffect(() => {
    // Reset authentication state when component mounts
    setIsAuthenticated(false);
    authenticateUser();
  }, []);
  
  // Authentication
  const authenticateUser = async () => {
    if (useBiometrics && Platform.OS !== 'web') {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to access secure files',
          fallbackLabel: 'Use PIN',
        });
        
        if (result.success) {
          setIsAuthenticated(true);
        } else if (pin) {
          setShowPinModal(true);
        } else {
          // No PIN set, but biometrics failed
          Alert.alert('Authentication Failed', 'Please set up a PIN in settings for fallback authentication.');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        if (pin) {
          setShowPinModal(true);
        } else {
          Alert.alert('Authentication Error', 'Please try again or set up a PIN in settings.');
        }
      }
    } else if (pin) {
      setShowPinModal(true);
    } else {
      // No security set up, show warning and allow access
      Alert.alert(
        'Security Not Set Up',
        'For better protection, please set up PIN or biometric authentication in Settings.',
        [{ text: 'OK', onPress: () => setIsAuthenticated(true) }]
      );
    }
  };
  
  // Handlers
  const handlePinSuccess = () => {
    setIsAuthenticated(true);
  };
  
  const handleFilePress = (file: FileItemType) => {
    // Open file viewer
    if (!file.isDirectory) {
      router.push(`/file-viewer?id=${file.id}`);
    }
  };
  
  const handleFileLongPress = (file: FileItemType) => {
    // No selection mode in secure folder for simplicity
  };
  
  const handleFileOptions = (file: FileItemType) => {
    setSelectedFile(file);
    setShowActionSheet(true);
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
  
  const handleRemoveFromSecure = (file: FileItemType) => {
    // Require authentication again for removing from secure
    if (useBiometrics && Platform.OS !== 'web') {
      LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to remove from secure storage',
        fallbackLabel: 'Use PIN',
      }).then(result => {
        if (result.success) {
          performRemoveFromSecure(file);
        } else {
          Alert.alert('Authentication Failed', 'Cannot remove file from secure storage');
        }
      }).catch(error => {
        console.error('Authentication error:', error);
        Alert.alert('Authentication Error', 'Please try again');
      });
    } else if (pin) {
      // Show PIN modal for verification
      setSelectedFile(file);
      Alert.alert(
        'Authentication Required',
        'Enter your PIN to remove file from secure storage',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Enter PIN', 
            onPress: () => {
              setShowPinModal(true);
              // We'll handle this in the PIN success callback
            }
          },
        ]
      );
    } else {
      performRemoveFromSecure(file);
    }
  };
  
  const performRemoveFromSecure = (file: FileItemType) => {
    removeFromSecure(file.id);
    Alert.alert('Success', `"${file.name}" removed from secure storage`);
  };
  
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={darkMode ? 'light' : 'dark'} />
        
        <View style={styles.authContainer}>
          <Lock size={64} color={theme.primary} style={styles.lockIcon} />
          
          <Text style={[styles.authTitle, { color: theme.text }]}>
            Secure Files
          </Text>
          
          <Text style={[styles.authDescription, { color: theme.subtext }]}>
            Authentication required to access secure files
          </Text>
          
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: theme.primary }]}
            onPress={authenticateUser}
          >
            {useBiometrics && Platform.OS !== 'web' ? (
              <>
                <Fingerprint size={20} color="#fff" />
                <Text style={styles.authButtonText}>Authenticate</Text>
              </>
            ) : (
              <Text style={styles.authButtonText}>Enter PIN</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <PinModal
          visible={showPinModal}
          onClose={() => setShowPinModal(false)}
          onSuccess={handlePinSuccess}
        />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Secure Files</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          Your protected files and folders
        </Text>
      </View>
      
      <View style={styles.content}>
        {secureFiles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Lock size={64} color={theme.primary} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Secure Files
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.subtext }]}>
              Move files to secure storage from the home screen
            </Text>
          </View>
        ) : (
          <FlatList
            data={secureFiles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FileItem
                file={item}
                onPress={handleFilePress}
                onLongPress={handleFileLongPress}
                onOptionsPress={handleFileOptions}
                isSelected={false}
              />
            )}
            contentContainerStyle={styles.filesList}
          />
        )}
      </View>
      
      {/* Modals */}
      <FileActionSheet
        file={selectedFile}
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        onShare={handleShareFile}
        onRename={handleRenameFile}
        onDelete={handleDeleteFile}
        onCopy={handleCopyFile}
        onMove={handleMoveFile}
        onSecure={() => {}}
        onRemoveFromSecure={handleRemoveFromSecure}
      />
      
      <RenameModal
        file={selectedFile}
        visible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onRename={handleRenameConfirm}
      />
      
      <PinModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => {
          if (selectedFile) {
            performRemoveFromSecure(selectedFile);
          }
          setShowPinModal(false);
        }}
      />
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
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filesList: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockIcon: {
    marginBottom: 24,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  authDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: '80%',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});