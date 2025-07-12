import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { FileItem as FileItemType } from '../types';
import { formatFileSize } from '../utils/fileUtils';
import { useSettingsStore } from '../store/settingsStore';
import { useFileStore } from '../store/fileStore';
import { File, Folder, Lock, MoreVertical } from 'lucide-react-native';
import colors from '../constants/colors';

interface FileItemProps {
  file: FileItemType;
  onPress: (file: FileItemType) => void;
  onLongPress: (file: FileItemType) => void;
  onOptionsPress: (file: FileItemType) => void;
  isSelected: boolean;
}

const FileItem: React.FC<FileItemProps> = ({ 
  file, 
  onPress, 
  onLongPress, 
  onOptionsPress,
  isSelected 
}) => {
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  const getFileIcon = () => {
    if (file.isDirectory) {
      return <Folder size={24} color={theme.icon} />;
    }
    
    switch (file.type) {
      case 'image':
        if (file.thumbnail) {
          return (
            <Image
              source={{ uri: file.thumbnail }}
              style={styles.thumbnail}
              contentFit="cover"
            />
          );
        }
        return <File size={24} color={theme.icon} />;
      case 'video':
        if (file.thumbnail) {
          return (
            <Image
              source={{ uri: file.thumbnail }}
              style={styles.thumbnail}
              contentFit="cover"
            />
          );
        }
        return <File size={24} color={theme.icon} />;
      default:
        return <File size={24} color={theme.icon} />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isSelected ? theme.secondary + '40' : theme.card },
        { borderColor: theme.border }
      ]}
      onPress={() => onPress(file)}
      onLongPress={() => onLongPress(file)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {getFileIcon()}
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.nameContainer}>
          <Text 
            style={[styles.fileName, { color: theme.text }]} 
            numberOfLines={1}
          >
            {file.name}
          </Text>
          {file.isSecure && (
            <Lock size={16} color={theme.primary} style={styles.secureIcon} />
          )}
        </View>
        
        <Text style={[styles.fileDetails, { color: theme.subtext }]}>
          {!file.isDirectory && formatFileSize(file.size)} • {formatDate(file.modifiedTime)}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.optionsButton}
        onPress={() => onOptionsPress(file)}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <MoreVertical size={20} color={theme.subtext} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  secureIcon: {
    marginLeft: 6,
  },
  fileDetails: {
    fontSize: 12,
    marginTop: 4,
  },
  optionsButton: {
    padding: 4,
  },
});

export default FileItem;