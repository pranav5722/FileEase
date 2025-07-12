import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { FileItem } from '../types';
import { useSettingsStore } from '../store/settingsStore';
import colors from '../constants/colors';
import { Copy, Delete, Download, Edit, Lock, Share2, Unlock } from 'lucide-react-native';

interface FileActionSheetProps {
  file: FileItem | null;
  visible: boolean;
  onClose: () => void;
  onShare: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onCopy: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onSecure: (file: FileItem) => void;
  onRemoveFromSecure: (file: FileItem) => void;
}

const FileActionSheet: React.FC<FileActionSheetProps> = ({
  file,
  visible,
  onClose,
  onShare,
  onRename,
  onDelete,
  onCopy,
  onMove,
  onSecure,
  onRemoveFromSecure,
}) => {
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  if (!file) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View 
          style={[
            styles.container, 
            { backgroundColor: theme.card }
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              {file.name}
            </Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>
              Select an action
            </Text>
          </View>
          
          <View style={styles.actionList}>
            {!file.isDirectory && (
              <TouchableOpacity 
                style={styles.actionItem} 
                onPress={() => {
                  onShare(file);
                  onClose();
                }}
              >
                <Share2 size={22} color={theme.primary} />
                <Text style={[styles.actionText, { color: theme.text }]}>Share</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => {
                onRename(file);
                onClose();
              }}
            >
              <Edit size={22} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>Rename</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => {
                onCopy(file);
                onClose();
              }}
            >
              <Copy size={22} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>Copy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => {
                onMove(file);
                onClose();
              }}
            >
              <Download size={22} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>Move</Text>
            </TouchableOpacity>
            
            {file.isSecure ? (
              <TouchableOpacity 
                style={styles.actionItem} 
                onPress={() => {
                  onRemoveFromSecure(file);
                  onClose();
                }}
              >
                <Unlock size={22} color={theme.primary} />
                <Text style={[styles.actionText, { color: theme.text }]}>Remove from Secure</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.actionItem} 
                onPress={() => {
                  onSecure(file);
                  onClose();
                }}
              >
                <Lock size={22} color={theme.primary} />
                <Text style={[styles.actionText, { color: theme.text }]}>Move to Secure</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.actionItem, styles.deleteAction]} 
              onPress={() => {
                onDelete(file);
                onClose();
              }}
            >
              <Delete size={22} color={theme.danger} />
              <Text style={[styles.actionText, { color: theme.danger }]}>Delete</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.cancelButton, { backgroundColor: theme.border }]} 
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  actionList: {
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionText: {
    fontSize: 16,
    marginLeft: 16,
  },
  deleteAction: {
    borderBottomWidth: 0,
  },
  cancelButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FileActionSheet;